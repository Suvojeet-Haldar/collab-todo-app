import React from 'react';
import TaskCard from './TaskCard';

const Column = ({ status, tasks, onDropTask, onSmartAssign, onDelete, users }) => {
  return (
    <div className="kanban-column">
      <h3>{status}</h3>
      {tasks.map(task => (
        <TaskCard
          key={task._id}
          task={task}
          onDropTask={onDropTask}
          onSmartAssign={onSmartAssign}
          onDelete={onDelete}
          users={users}
        />
      ))}
    </div>
  );
};

export default Column;
