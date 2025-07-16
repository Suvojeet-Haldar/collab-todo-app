import { useTheme } from '../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import Column from '../components/Column';
import { DragDropContext } from 'react-beautiful-dnd';
import '../styles/board.css';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const Board = () => {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ✅ Correct usage
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAll();

    socket.on('task_created', task => {
      setTasks(prev => {
        const exists = prev.some(t => t._id === task._id);
        return exists ? prev : [...prev, task];
      });
    });

    socket.on('task_updated', updated => {
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
    });

    socket.on('task_deleted', id => {
      setTasks(prev => prev.filter(t => t._id !== id));
    });

    return () => {
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [taskRes, userRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/users`, config)
      ]);
      setTasks(taskRes.data);
      setUsers(userRes.data);
    } catch {
      alert('Failed to load data');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return alert('Title required');
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tasks`, newTask, config);
      setNewTask({ title: '', description: '' });
      setTasks(prev => [...prev, res.data]);
    } catch {
      alert('Could not create task');
    }
  };

  const moveTask = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`, updatedTask, config);
    } catch {
      alert('Could not move task');
    }
  };

  const handleSmartAssign = async (id) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/smart-assign/${id}`, {}, config);
      setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
    } catch {
      alert('Could not smart assign');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${id}`, config);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch {
      alert('Could not delete task');
    }
  };

  const handleManualAssign = async (taskId, userId) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${taskId}`, { assignedTo: userId }, config);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch {
      alert('Could not assign task');
    }
  };

  const handleDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const draggedTask = tasks.find(t => t._id === draggableId);
    if (draggedTask) {
      moveTask(draggedTask, destination.droppableId);
    }
  };

  return (
    <div className="board-wrapper">
      {/* ✅ TOP-RIGHT THEME TOGGLE */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: theme === 'light' ? '#333' : '#eee',
            color: theme === 'light' ? '#fff' : '#000',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      {/* ✅ GREETING + LOGOUT */}
      <div className="board-header">
        <h2>Hello, {user?.name || 'Guest'}</h2>
        <button onClick={() => {
          logout();
          navigate('/');
        }} className="logout-btn">
          Logout
        </button>
      </div>

      {/* ✅ TASK INPUT FORM */}
      <form className="task-form" onSubmit={handleCreate} style={{ maxWidth: '900px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          className="task-input"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          className="task-input"
        />
        <button type="submit" className="add-btn">Add Task</button>
      </form>

      {/* ✅ COLUMNS */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {STATUSES.map(status => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter(task => task.status === status)}
              onDropTask={moveTask}
              onSmartAssign={handleSmartAssign}
              onDelete={handleDelete}
              onManualAssign={handleManualAssign}
              users={users}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
