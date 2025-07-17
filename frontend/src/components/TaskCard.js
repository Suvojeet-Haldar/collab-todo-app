// frontend/src/components/TaskCard.js

import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ConflictModal from './ConflictModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, index, onDropTask, onSmartAssign, onDelete, onManualAssign, users }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ title: task.title, description: task.description });
  const [conflictData, setConflictData] = useState(null);
  const { token } = useAuth();

  const assignedName =
    typeof task.assignedTo === 'object' && task.assignedTo?.name
      ? task.assignedTo.name
      : users.find(u => u._id === task.assignedTo)?.name || 'Unassigned';

  const handleSave = async () => {
    if (
      editedTask.title.trim() === task.title &&
      editedTask.description.trim() === task.description
    ) {
      setIsEditing(false);
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const serverTask = res.data;

      if (new Date(serverTask.lastEdited).getTime() !== new Date(task.lastEdited).getTime()) {
        // Conflict detected
        setConflictData({
          clientVersion: { ...task, ...editedTask },
          serverVersion: serverTask
        });
      } else {
        const updatedTask = {
          ...task,
          ...editedTask,
          lastEdited: new Date().toISOString()
        };
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`, updatedTask, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('❌ Conflict check failed:', err);
      alert('Error checking for conflict');
    }
  };

  const handleConflictResolve = async (resolvedTask) => {
    try {
      resolvedTask.lastEdited = new Date().toISOString();
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`,
        resolvedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConflictData(null);
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Failed to resolve conflict:', err);
      alert('Failed to save resolved task');
    }
  };

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided) => (
          <div
            className="task-card fade-in-animate"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                />
                <textarea
                  value={editedTask.description}
                  onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                />
                <div className="task-actions">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setEditedTask({ title: task.title, description: task.description });
                  }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
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
                  <button onClick={() => setIsEditing(true)}>Edit</button>
                  <button onClick={() => onDelete(task._id)} className="delete-btn">Delete</button>
                </div>
              </>
            )}
          </div>
        )}
      </Draggable>

      {conflictData && (
        <ConflictModal
          clientVersion={conflictData.clientVersion}
          serverVersion={conflictData.serverVersion}
          onResolve={handleConflictResolve}
          onCancel={() => setConflictData(null)}
        />
      )}
    </>
  );
};

export default TaskCard;
