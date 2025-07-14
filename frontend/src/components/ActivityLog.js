import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const { token } = useAuth();

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
    <div className="activity-log">
      <h4>📝 Activity Log</h4>
      <ul>
        {logs.map(log => (
          <li key={log._id}>
            <strong>{log.performedBy?.name}</strong> {log.action}d task <em>{log.taskId?.title}</em> at {new Date(log.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
