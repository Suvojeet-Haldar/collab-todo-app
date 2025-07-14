const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastEdited: Date,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

TaskSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Task', TaskSchema);
