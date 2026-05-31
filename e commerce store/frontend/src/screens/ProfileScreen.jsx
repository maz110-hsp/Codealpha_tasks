import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaClipboardList, FaClock, FaCreditCard, FaLock, FaTimes, FaTruck, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const { data: orders = [], isLoading: loadingOrders, error: errorOrders } = useGetMyOrdersQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const activity = useMemo(() => {
    const totalSpent = orders
      .filter((order) => order.isPaid)
      .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    return {
      totalOrders: orders.length,
      paidOrders: orders.filter((order) => order.isPaid).length,
      activeOrders: orders.filter((order) => !order.isDelivered).length,
      totalSpent: totalSpent.toFixed(2),
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await updateProfile({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      <section className="profile-hero glass">
        <div>
          <span className="eyebrow">Customer profile</span>
          <h1>{userInfo?.name}</h1>
          <p>Track orders, payment states, delivery progress, and account details from one calm workspace.</p>
        </div>
        <div className="profile-hero-icon"><FaUser /></div>
      </section>

      <section className="activity-grid">
        <div className="activity-card glass">
          <FaClipboardList />
          <span>Total orders</span>
          <strong>{activity.totalOrders}</strong>
        </div>
        <div className="activity-card glass">
          <FaCreditCard />
          <span>Paid orders</span>
          <strong>{activity.paidOrders}</strong>
        </div>
        <div className="activity-card glass">
          <FaTruck />
          <span>Active shipments</span>
          <strong>{activity.activeOrders}</strong>
        </div>
        <div className="activity-card glass">
          <FaCheck />
          <span>Paid value</span>
          <strong>${activity.totalSpent}</strong>
        </div>
      </section>

      <div className="profile-grid">
        <section className="glass profile-panel">
          <h2><FaLock /> Account settings</h2>
          <form onSubmit={submitHandler} className="auth-form">
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep same"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loadingUpdateProfile} className="auth-submit">
              {loadingUpdateProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </section>

        <section className="glass profile-panel profile-orders-panel">
          <div className="profile-panel-header">
            <h2><FaClipboardList /> Recent activity</h2>
            <Link to="/">Continue shopping</Link>
          </div>

          {loadingOrders ? (
            <div className="loading-spinner" />
          ) : errorOrders ? (
            <div className="alert-error">{errorOrders?.data?.message || errorOrders.error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-profile-orders">
              <p>You have not placed any orders yet.</p>
              <Link to="/" className="btn-pill btn-pill-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="profile-order-list">
              {recentOrders.map((order) => (
                <Link to={`/order/${order._id}`} className="profile-order-card" key={order._id}>
                  <div>
                    <strong>#{order._id.substring(order._id.length - 8)}</strong>
                    <span>{order.createdAt.substring(0, 10)} | {order.paymentMethod}</span>
                  </div>
                  <div className="profile-order-status">
                    <span className={order.isPaid ? 'success' : 'danger'}>
                      {order.isPaid ? <FaCheck /> : <FaTimes />}
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                    <span className={order.isDelivered ? 'success' : 'warning'}>
                      {order.isDelivered ? <FaCheck /> : <FaClock />}
                      {order.isDelivered ? 'Delivered' : 'In progress'}
                    </span>
                  </div>
                  <strong className="profile-order-total">${order.totalPrice}</strong>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfileScreen;
