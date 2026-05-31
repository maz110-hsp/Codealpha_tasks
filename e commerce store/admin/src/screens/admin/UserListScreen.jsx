import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { useGetUsersQuery, useDeleteUserMutation } from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';
import EmptyState from '../../components/EmptyState';

const UserListScreen = () => {
    const { data: users, refetch, isLoading, error } = useGetUsersQuery();

    const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                refetch();
                toast.success('User removed successfully');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <div className="admin-shell animate-fade-in">
            <div className="admin-header">
                <div>
                    <h1>Users</h1>
                    <p>Review accounts, roles and contact information.</p>
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
            ) : users && users.length === 0 ? (
                <EmptyState
                    title="No Users Found"
                    message="There are currently no users registered in the system."
                    icon={FaUsers}
                />
            ) : (
                <div className="glass overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-surface-color/50 border-b border-white/10 uppercase text-xs tracking-wider">
                                    <th className="p-4 font-bold text-slate-400">ID</th>
                                    <th className="p-4 font-bold text-slate-400">Name</th>
                                    <th className="p-4 font-bold text-slate-400">Email</th>
                                    <th className="p-4 font-bold text-slate-400">Admin</th>
                                    <th className="p-4 font-bold text-slate-400"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-xs text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
                                            {user._id}
                                        </td>
                                        <td className="p-4 font-semibold text-slate-200">
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            <a
                                                href={`mailto:${user.email}`}
                                                className="text-primary-color hover:text-secondary-color transition-colors"
                                            >
                                                {user.email}
                                            </a>
                                        </td>
                                        <td className="p-4">
                                            {user.isAdmin ? (
                                                <FaCheck className="text-success ml-1" />
                                            ) : (
                                                <FaTimes className="text-danger ml-1" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-3">
                                                <Link
                                                    to={`/admin/user/${user._id}/edit`}
                                                    className="p-2.5 bg-surface-color/50 hover:bg-primary-color/20 rounded-lg text-slate-300 hover:text-primary-color transition-colors border border-white/5 hover:border-primary-color/30"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    className="p-2.5 bg-danger/10 hover:bg-danger/20 rounded-lg text-danger hover:text-red-400 transition-colors border border-danger/10 hover:border-danger/30"
                                                    onClick={() => deleteHandler(user._id)}
                                                    disabled={loadingDelete}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListScreen;
