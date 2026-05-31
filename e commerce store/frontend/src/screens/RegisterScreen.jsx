import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const urlRedirect = sp.get('redirect');

  useEffect(() => {
    if (userInfo) {
      navigate(urlRedirect || '/');
    }
  }, [navigate, urlRedirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setFormError('');
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(urlRedirect || '/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-shell animate-fade-in">
      <div className="auth-grid">
        <div className="auth-hero glass">
          <div className="auth-hero-badge">Join PROStore</div>
          <h1 className="auth-hero-title">
            Create your <span className="text-gradient">customer profile</span>.
          </h1>
          <p className="auth-hero-text">
            Save your cart, follow orders, and build a complete activity history around the gear you buy.
          </p>
          <ul className="auth-hero-highlights">
            <li>One profile across checkout and order tracking</li>
            <li>Clear delivery and payment activity</li>
            <li>Cleaner support history for every order</li>
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
            <h2>Create account</h2>
            <p>Start with the details you will use for checkout.</p>
          </div>

          {(error || formError) && (
            <div className="auth-error">
              {formError || error?.data?.message || 'Something went wrong. Please check your details.'}
            </div>
          )}

          <form onSubmit={submitHandler} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className={`auth-submit ${isLoading ? 'auth-submit-loading' : ''}`}>
              {isLoading ? 'Creating your account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer-text">
            Already have an account?{' '}
            <Link to={urlRedirect ? `/login?redirect=${urlRedirect}` : '/login'}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
