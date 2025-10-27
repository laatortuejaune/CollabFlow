const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    }).populate('owner members.user', 'username fullName avatar');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const project = new Project({
      name,
      description,
      owner: req.userId,
      members: [{ user: req.userId, role: 'owner' }],
      tags
    });
    await project.save();
    await User.findByIdAndUpdate(req.userId, {
      $push: { projects: project._id }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner members.user boards', 'username fullName avatar name');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, status, tags } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, description, status, tags },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
