const Task = require('../models/Task');
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

// 📍 backend/controllers/taskController.js

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name') // only get 'name' field
      .sort({ lastEdited: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};


exports.createTask = async (req, res, io) => {
  try {
    const task = await Task.create({
      ...req.body,
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
    res.status(400).json({ error: 'Task title must be unique and valid' });
  }
};

exports.updateTask = async (req, res, io) => {
  const { id } = req.params;
  const incomingTask = req.body;

  try {
    const existingTask = await Task.findById(id);
    if (!existingTask) return res.status(404).json({ msg: 'Task not found' });

    const now = new Date();

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...incomingTask,
        updatedBy: req.user.id,
        lastEdited: now
      },
      { new: true }
    );

    console.log("✅ Task updated assignedTo:", updatedTask.assignedTo);

    // ✅ Populate before emitting or sending to frontend
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
