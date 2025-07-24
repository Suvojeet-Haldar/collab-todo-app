// frontend/src/pages/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css'; // ✅ Using same styles as Login

const Register = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // ✅ Clear error dynamically on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // ✅ Clear previous errors

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match'); // ✅ Show browser popup only
      return;
    }

    try {
      const { name, email, password } = form; // omit confirmPassword
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      login(res.data);
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Theme Toggle Button */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: theme === 'light' ? '#2e2e2e' : '#eee',
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
          <h1 className="app-title">Get Started with CollabBoard</h1>
          <p className="tagline">Collaborate in real-time with your team.</p>
          <p className="description">
            Sign up and start organizing tasks today.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>

        {/* ✅ Only show error if it's from backend (e.g. email already exists) */}
        {error && error !== 'Passwords do not match' && <p className="error">{error}</p>}

        <p>
          Already registered? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
