// frontend/src/components/TaskCard.js

import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const TaskCard = ({ task, index, onDropTask, onSmartAssign, onDelete, onManualAssign, users }) => {
  const assignedName =
  typeof task.assignedTo === 'object' && task.assignedTo?.name
    ? task.assignedTo.name
    : users.find(u => u._id === task.assignedTo)?.name || 'Unassigned';


  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
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
            <select
              onChange={e => onManualAssign(task._id, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Assign to...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <button onClick={() => onSmartAssign(task._id)}>Smart Assign</button>
            <button onClick={() => onDelete(task._id)} className="delete-btn">Delete</button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
