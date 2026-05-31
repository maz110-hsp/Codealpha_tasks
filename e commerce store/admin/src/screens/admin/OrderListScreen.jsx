import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import EmptyState from '../../components/EmptyState';

const OrderListScreen = () => {
    const { data: orders, isLoading, error } = useGetOrdersQuery();

    return (
        <div className="animate-fade-in py-6">
            <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-center lg:text-left">
                Manage <span className="text-gradient">Orders</span>
            </h1>

            {isLoading ? (
                <div className="flex justify-center my-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-color"></div>
                </div>
            ) : error ? (
                <div className="bg-danger/20 text-danger p-6 rounded-xl text-center font-bold border border-danger/30">
                    {error?.data?.message || error.error}
                </div>
            ) : orders && orders.length === 0 ? (
                <EmptyState 
                    title="No Orders Found" 
                    message="There are no orders to display at this time." 
                    icon={FaClipboardList} 
                />
            ) : (
                <div className="glass overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-surface-color/50 border-b border-white/10 uppercase text-sm tracking-wider">
                                    <th className="p-5 font-bold text-slate-400">ID</th>
                                    <th className="p-5 font-bold text-slate-400">USER</th>
                                    <th className="p-5 font-bold text-slate-400">DATE</th>
                                    <th className="p-5 font-bold text-slate-400">TOTAL</th>
                                    <th className="p-5 font-bold text-slate-400">PAID</th>
                                    <th className="p-5 font-bold text-slate-400">DELIVERED</th>
                                    <th className="p-5 font-bold text-slate-400"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5 text-sm text-slate-500 font-mono group-hover:text-slate-400 transition-colors">{order._id}</td>
                                        <td className="p-5 font-semibold text-slate-300">{order.user && order.user.name}</td>
                                        <td className="p-5 text-slate-300">{order.createdAt.substring(0, 10)}</td>
                                        <td className="p-5 text-gradient font-bold">${order.totalPrice}</td>
                                        <td className="p-5">
                                            {order.isPaid ? (
                                                <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-bold border border-success/30">
                                                    {order.paidAt.substring(0, 10)}
                                                </span>
                                            ) : (
                                                <FaTimes className="text-danger ml-3" />
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {order.isDelivered ? (
                                                <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-bold border border-success/30">
                                                    {order.deliveredAt.substring(0, 10)}
                                                </span>
                                            ) : (
                                                <FaTimes className="text-danger ml-3" />
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <Link to={`/admin/order/${order._id}`}>
                                                <button className="bg-surface-color/50 hover:bg-primary-color text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-white/5 hover:border-primary-color/50 font-semibold text-sm">
                                                    Details
                                                </button>
                                            </Link>
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

export default OrderListScreen;
