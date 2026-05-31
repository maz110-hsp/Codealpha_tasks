import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaBoxOpen, FaChartLine, FaClipboardList, FaExternalLinkAlt, FaSignOutAlt, FaTimes, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
  { to: '/admin/productlist', label: 'Products', icon: <FaBoxOpen /> },
  { to: '/admin/orderlist', label: 'Orders', icon: <FaClipboardList /> },
  { to: '/admin/userlist', label: 'Users', icon: <FaUsers /> },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Could not sign out');
    }
  };

  return (
    <div className="admin-console">
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span>PRO</span>Store Admin
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <a className="admin-storefront-link" href={storefrontUrl}>
          <FaExternalLinkAlt />
          Open Storefront
        </a>
      </aside>

      <div className="admin-content-shell">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle admin navigation"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div>
            <p>Signed in as</p>
            <strong>{userInfo?.name}</strong>
          </div>
          <button type="button" className="admin-logout-button" onClick={logoutHandler}>
            <FaSignOutAlt />
            Sign out
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
