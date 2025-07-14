const Task = require('../models/Task');
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'name');
  res.json(tasks);
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

    // Conflict detection: if task was edited within last 5s by someone else
    const now = new Date();
    if (existingTask.lastEdited && existingTask.lastEdited.getTime() !== new Date(incomingTask.lastEdited).getTime()) {
      return res.status(409).json({
        conflict: true,
        serverVersion: existingTask
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...incomingTask,
        updatedBy: req.user.id,
        lastEdited: now
      },
      { new: true }
    );

    io.emit('task_updated', updatedTask);

    await ActionLog.create({
      action: 'update',
      taskId: updatedTask._id,
      performedBy: req.user.id
    });

    io.emit('log_updated');

    res.json(updatedTask);
  } catch (err) {
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
