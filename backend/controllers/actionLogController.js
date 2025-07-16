// backend/controllers/actionLogController.js

const ActionLog = require('../models/ActionLog');
const User = require('../models/User');
const Task = require('../models/Task');

exports.getRecentLogs = async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('performedBy', 'name')
      .populate('taskId', 'title');

    const formatted = logs.map(log => ({
      id: log._id,
      action: log.action,
      taskTitle: log.taskId?.title || '[Deleted Task]',
      userName: log.performedBy?.name || 'Unknown',
      time: log.timestamp,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};
