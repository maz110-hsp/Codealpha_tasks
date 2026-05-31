import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaLock, FaStore, FaUserShield } from 'react-icons/fa';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const AdminLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessError, setAccessError] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setAccessError('');
    const res = await login({ email, password }).unwrap();
    if (!res.isAdmin) {
      setAccessError('This account is not allowed to access the admin dashboard.');
      return;
    }
    dispatch(setCredentials({ ...res }));
    navigate('/admin/dashboard');
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-hero">
        <div className="admin-login-badge">
          <FaUserShield />
          Admin workspace
        </div>
        <h1>Run the store from a focused command center.</h1>
        <p>
          Manage catalog, customers, orders, delivery states, and payment review without sharing space with the customer storefront.
        </p>
        <Link to={storefrontUrl} className="admin-login-store-link">
          <FaStore />
          Back to storefront
        </Link>
      </section>

      <section className="admin-login-card glass">
        <div className="auth-card-header">
          <h2>Admin sign in</h2>
          <p>Use an account with administrator access.</p>
        </div>

        {(error || accessError) && (
          <div className="auth-error">
            {accessError || error?.data?.message || 'Invalid admin credentials.'}
          </div>
        )}

        <form onSubmit={submitHandler} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={isLoading}>
            <FaLock />
            {isLoading ? 'Signing in...' : 'Enter dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLoginScreen;
