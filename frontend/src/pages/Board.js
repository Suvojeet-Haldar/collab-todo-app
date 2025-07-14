import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import Column from '../components/Column';
import '../styles/board.css';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const Board = () => {
  const { token, user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchAll();
    socket.on('task_created', task => setTasks(prev => [...prev, task]));
    socket.on('task_updated', updated => setTasks(prev => prev.map(t => t._id === updated._id ? updated : t)));
    socket.on('task_deleted', id => setTasks(prev => prev.filter(t => t._id !== id)));

    return () => socket.off(); // cleanup on unmount
  }, []);

  const fetchAll = async () => {
    try {
      const [taskRes, userRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/users`, config) // need to expose user list endpoint
      ]);
      setTasks(taskRes.data);
      setUsers(userRes.data);
      setLoading(false);
    } catch {
      alert('Failed to load data');
    }
  };

  const moveTask = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`, updatedTask, config);
    } catch (err) {
      alert('Could not move task');
    }
  };

  const handleSmartAssign = async (id) => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/smart-assign/${id}`, {}, config);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/${id}`, config);
  };

  return (
    <div className="board-wrapper">
      <div className="board-header">
        <h2>Hello, {user.name}</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="board-columns">
        {STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter(task => task.status === status)}
            onDropTask={moveTask}
            onSmartAssign={handleSmartAssign}
            onDelete={handleDelete}
            users={users}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
