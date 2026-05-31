import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className="admin-app-shell">
      <ToastContainer theme="dark" position="bottom-right" />
      <Outlet />
    </div>
  );
};

export default App;
