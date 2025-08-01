// backend/routes/log.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ActionLog = require('../models/ActionLog');

router.get('/', auth, async (req, res) => {
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
});

module.exports = router;
