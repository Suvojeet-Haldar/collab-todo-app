// frontend/src/components/Column.js

import React from 'react';
import TaskCard from './TaskCard';
import { Droppable } from 'react-beautiful-dnd';

const Column = ({ status, tasks, onDropTask, onSmartAssign, onDelete, onManualAssign, users }) => {
  return (
    <div className="column">
      <h3>{status}</h3>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className="column-tasks"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : 'transparent',
              minHeight: '50px',
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onDropTask={onDropTask}
                onSmartAssign={onSmartAssign}
                onDelete={onDelete}
                onManualAssign={onManualAssign}
                users={users}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
