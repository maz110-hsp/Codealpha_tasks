import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';

const App = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('prostore-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('prostore-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <ToastContainer theme={theme === 'dark' ? 'dark' : 'light'} position="bottom-right" />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
