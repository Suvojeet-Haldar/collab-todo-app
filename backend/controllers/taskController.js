// backend/controllers/taskController.js

const Task = require('../models/Task');
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

// ✅ Fetch a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('❌ Failed to get task:', err);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

// ✅ Fetch all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// ✅ Create task with validation
exports.createTask = async (req, res, io) => {
  try {
    const title = req.body.title.trim();

    const forbiddenTitles = ['todo', 'in progress', 'done'];
    if (forbiddenTitles.includes(title.toLowerCase())) {
      return res.status(400).json({ error: 'Task title cannot match column names (Todo, In Progress, Done)' });
    }

    const existing = await Task.findOne({ title: new RegExp(`^${title}$`, 'i') });
    if (existing) {
      return res.status(400).json({ error: 'Task title must be unique' });
    }

    const task = await Task.create({
      ...req.body,
      title,
      updatedBy: req.user.id,
      lastEdited: new Date()
    });

    io.emit('task_created', task);

    await ActionLog.create({
      action: 'create',
      taskId: task._id,
      performedBy: req.user.id
    });

    io.emit('log_updated');

    res.status(201).json(task);
  } catch (err) {
    console.error('❌ Create task failed:', err);
    res.status(400).json({ error: 'Task creation failed' });
  }
};

// ✅ Update task with validation and conflict detection
exports.updateTask = async (req, res, io) => {
  const { id } = req.params;
  const incomingTask = req.body;

  try {
    const existingTask = await Task.findById(id);
    if (!existingTask) return res.status(404).json({ msg: 'Task not found' });

    const clientEditedAt = new Date(incomingTask.lastEdited);
    const serverEditedAt = new Date(existingTask.lastEdited);

    if (clientEditedAt < serverEditedAt) {
      return res.status(409).json({
        message: 'Conflict detected',
        clientVersion: incomingTask,
        serverVersion: existingTask
      });
    }

    const newTitle = incomingTask.title?.trim();
    if (newTitle) {
      const forbiddenTitles = ['todo', 'in progress', 'done'];
      if (forbiddenTitles.includes(newTitle.toLowerCase())) {
        return res.status(400).json({ error: 'Task title cannot match column names (Todo, In Progress, Done)' });
      }

      const duplicate = await Task.findOne({
        _id: { $ne: id },
        title: new RegExp(`^${newTitle}$`, 'i')
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Task title must be unique' });
      }
    }

    const now = new Date();

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...incomingTask,
        title: newTitle,
        updatedBy: req.user.id,
        lastEdited: now
      },
      { new: true }
    );

    const populatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name');

    io.emit('task_updated', populatedTask);

    await ActionLog.create({
      action: 'update',
      taskId: populatedTask._id,
      performedBy: req.user.id
    });

    io.emit('log_updated');

    res.json(populatedTask);
  } catch (err) {
    console.error('❌ Task update failed:', err);
    res.status(400).json({ error: 'Could not update task' });
  }
};

// ✅ Delete task
exports.deleteTask = async (req, res, io) => {
  const { id } = req.params;
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ msg: 'Not found' });

  io.emit('task_deleted', deleted._id);

  await ActionLog.create({
    action: 'delete',
    taskId: deleted._id,
    performedBy: req.user.id
  });

  io.emit('log_updated');

  res.json({ msg: 'Task deleted' });
};

// ✅ Smart assign task
exports.smartAssign = async (req, res, io) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ msg: 'Task not found' });

  const activeTasks = await Task.find({ status: { $ne: 'Done' } });
  const userTaskCounts = {};

  activeTasks.forEach(t => {
    const uid = t.assignedTo?.toString();
    if (uid) userTaskCounts[uid] = (userTaskCounts[uid] || 0) + 1;
  });

  const users = await User.find();
  let targetUser = null;
  let minCount = Infinity;

  users.forEach(user => {
    const count = userTaskCounts[user._id.toString()] || 0;
    if (count < minCount) {
      minCount = count;
      targetUser = user;
    }
  });

  if (!targetUser) return res.status(400).json({ msg: 'No users to assign' });

  task.assignedTo = targetUser._id;
  task.updatedBy = req.user.id;
  task.lastEdited = new Date();
  await task.save();

  io.emit('task_updated', task);

  await ActionLog.create({
    action: 'smart_assign',
    taskId: task._id,
    performedBy: req.user.id
  });

  io.emit('log_updated');

  res.json(task);
};
