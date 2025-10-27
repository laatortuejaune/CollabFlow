const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Notification = require('../models/Notification');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, boardId, projectId, assignedTo } = req.body;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify board exists if provided
    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      board: boardId,
      project: projectId,
      createdBy: req.user.id,
      assignedTo
    });

    await task.save();

    // Create notification if task is assigned
    if (assignedTo && assignedTo.toString() !== req.user.id) {
      const notification = new Notification({
        user: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned to task: ${title}`,
        relatedTask: task._id,
        relatedProject: projectId
      });
      await notification.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('board', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/board/:boardId
// @desc    Get all tasks for a board
// @access  Private
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const project = board.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ board: req.params.boardId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching board tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('board', 'name')
      .populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo } = req.body;

    let task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;
    if (project.owner.toString() !== req.user.id && 
        !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if task is being reassigned
    if (assignedTo && task.assignedTo && assignedTo.toString() !== task.assignedTo.toString()) {
      const notification = new Notification({
        user: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned to task: ${task.title}`,
        relatedTask: task._id,
        relatedProject: project._id
      });
      await notification.save();
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('board', 'name');

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
