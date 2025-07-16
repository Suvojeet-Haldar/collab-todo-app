// backend/routes/task.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

module.exports = (io) => {
  router.get('/', auth, (req, res) => taskController.getAllTasks(req, res, io)); // modified below in controller
  router.post('/', auth, (req, res) => taskController.createTask(req, res, io));
  router.put('/:id', auth, (req, res) => taskController.updateTask(req, res, io));
  router.delete('/:id', auth, (req, res) => taskController.deleteTask(req, res, io));
  router.post('/smart-assign/:id', auth, (req, res) => taskController.smartAssign(req, res, io));
  return router;
};
