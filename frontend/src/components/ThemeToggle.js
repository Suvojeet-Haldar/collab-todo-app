// frontend/src/components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: theme === 'light' ? '#111' : '#eee',
        color: theme === 'light' ? '#fff' : '#000',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        ...style,
      }}
    >
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
};

export default ThemeToggle;
