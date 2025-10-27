const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Board = require('../models/Board');
const Project = require('../models/Project');

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, projectId } = req.body;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner or member
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const board = new Board({
      name,
      description,
      project: projectId,
      createdBy: req.user.id
    });

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/project/:projectId
// @desc    Get all boards for a project
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to project
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const boards = await Board.find({ project: req.params.projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/:id
// @desc    Get a specific board by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('project');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    const project = board.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    let board = await Board.findById(req.params.id).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    const project = board.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    board.name = name || board.name;
    board.description = description || board.description;

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is project owner
    const project = board.project;
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can delete boards' });
    }

    await board.deleteOne();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
