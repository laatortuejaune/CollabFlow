const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @route   POST /api/comments
// @desc    Create a new comment on a task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, taskId } = req.body;

    // Verify task exists
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to the project
    const project = task.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comment = new Comment({
      content,
      task: taskId,
      author: req.user.id
    });

    await comment.save();

    // Create notification for task assignee (if not the commenter)
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      const notification = new Notification({
        user: task.assignedTo,
        type: 'comment_added',
        message: `New comment on task: ${task.title}`,
        relatedTask: taskId,
        relatedProject: project._id
      });
      await notification.save();
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/task/:taskId
// @desc    Get all comments for a task
// @access  Private
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access
    const project = task.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/:id
// @desc    Get a specific comment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'task',
        populate: { path: 'project' }
      });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Verify user has access
    const project = comment.task.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;

    let comment = await Comment.findById(req.params.id).populate({
      path: 'task',
      populate: { path: 'project' }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only comment author can update it' });
    }

    comment.content = content || comment.content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate({
      path: 'task',
      populate: { path: 'project' }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author or project owner
    const project = comment.task.project;
    if (comment.author.toString() !== req.user.id && 
        project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
