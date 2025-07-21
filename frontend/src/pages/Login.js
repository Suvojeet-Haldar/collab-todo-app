// frontend/src/pages/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, form);
      login(res.data);
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Theme Toggle Button */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: theme === 'light' ? '#121212' : '#eee',
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

      <div className="login-container">
        {/* Landing Info */}
        <div className="landing-info">
          <h1 className="app-title">CollabBoard</h1>
          <p className="tagline">Plan. Assign. Collaborate. All in real-time.</p>
          <p className="description">
            CollabBoard is a real-time collaborative Kanban board designed to help teams manage tasks efficiently.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <p className="error">{error}</p>}
        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
