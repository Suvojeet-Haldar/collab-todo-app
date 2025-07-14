import React from 'react';

const TaskCard = ({ task, onDropTask, onSmartAssign, onDelete, users }) => {
  const assignedName = users.find(u => u._id === task.assignedTo)?.name || 'Unassigned';

  return (
    <div className="task-card">
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p><strong>Assigned to:</strong> {assignedName}</p>
      <p><strong>Priority:</strong> {task.priority}</p>

      <div className="task-actions">
        {task.status !== 'Done' && (
          <>
            <button onClick={() => onDropTask(task, 'Todo')}>Todo</button>
            <button onClick={() => onDropTask(task, 'In Progress')}>In Progress</button>
            <button onClick={() => onDropTask(task, 'Done')}>Done</button>
          </>
        )}
        <button onClick={() => onSmartAssign(task._id)}>Smart Assign</button>
        <button onClick={() => onDelete(task._id)} className="delete-btn">Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
