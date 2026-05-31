import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { ADMIN_URL } from '../constants';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const urlRedirect = sp.get('redirect');

  useEffect(() => {
    if (userInfo) {
      if (urlRedirect) {
        navigate(urlRedirect);
      } else if (userInfo.isAdmin) {
        window.location.assign(`${ADMIN_URL}/admin/dashboard`);
      } else {
        navigate('/');
      }
    }
  }, [navigate, urlRedirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      if (urlRedirect) {
        navigate(urlRedirect);
      } else if (res.isAdmin) {
        window.location.assign(`${ADMIN_URL}/admin/dashboard`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-shell animate-fade-in">
      <div className="auth-grid">
        <div className="auth-hero glass">
          <div className="auth-hero-badge">PROStore Premium Tech</div>
          <h1 className="auth-hero-title">
            Sign in to manage your <span className="text-gradient">shopping rhythm</span>.
          </h1>
          <p className="auth-hero-text">
            Track purchases, follow delivery progress, and keep your checkout preferences ready for the next drop.
          </p>
          <ul className="auth-hero-highlights">
            <li>Order activity and delivery visibility</li>
            <li>Saved cart and payment preference flow</li>
            <li>Faster checkout for returning customers</li>
          </ul>
        </div>

        <div className="auth-card glass">
          <Link to="/" className="home-button-floating" title="Back to Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Use your account to continue shopping.</p>
          </div>

          {error && (
            <div className="auth-error">
              {error?.data?.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          <form onSubmit={submitHandler} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className={`auth-submit ${isLoading ? 'auth-submit-loading' : ''}`}>
              {isLoading ? 'Signing you in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer-text">
            New customer?{' '}
            <Link to={urlRedirect ? `/register?redirect=${urlRedirect}` : '/register'}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
