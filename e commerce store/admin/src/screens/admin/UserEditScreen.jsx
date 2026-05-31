import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUserShield } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin }).unwrap();
      toast.success('User updated successfully');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="admin-shell animate-fade-in">
      <div className="mb-6">
        <Link to="/admin/userlist" className="btn-pill inline-flex items-center gap-2">
          <FaArrowLeft /> Go Back
        </Link>
      </div>

      <div className="admin-header">
        <div>
          <h1>Edit User</h1>
          <p>Modify user roles and personal information.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loader">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert-error">
          {error?.data?.message || error.error}
        </div>
      ) : (
        <div className="glass p-8 max-w-2xl mx-auto border border-white/5 shadow-2xl">
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="auth-field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-5 h-5 accent-primary-color"
              />
              <label htmlFor="isAdmin" className="text-slate-100 font-medium cursor-pointer flex items-center gap-2">
                <FaUserShield className="text-primary-color" />
                Administrator Privileges
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loadingUpdate}
                className="btn-pill btn-pill-primary w-full justify-center py-4 text-lg"
              >
                <FaSave /> {loadingUpdate ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserEditScreen;
