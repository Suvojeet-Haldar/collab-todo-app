// frontend/src/components/ActivityLog.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const { token } = useAuth();
  const { theme } = useTheme();

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchLogs();

    socket.on('log_updated', fetchLogs);
    return () => socket.off('log_updated', fetchLogs);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/logs`, config);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  return (
    <div
      className="activity-log"
      style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
        padding: '12px',
        marginTop: '20px',
        borderRadius: '8px',
        maxHeight: '200px',
        overflowY: 'auto',
        border: theme === 'dark' ? '1px solid #444' : '1px solid #ccc'
      }}
    >
      <h4>📝 Activity Log</h4>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {logs.map(log => (
          <li key={log.id} style={{ marginBottom: '8px' }}>
            <strong>{log.userName}</strong> {log.action}d task <em>{log.taskTitle}</em> at{' '}
            {new Date(log.time).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
