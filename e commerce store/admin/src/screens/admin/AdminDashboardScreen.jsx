import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaChartLine, FaClipboardList, FaUsers } from 'react-icons/fa';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetUsersQuery } from '../../slices/usersApiSlice';

const AdminDashboardScreen = () => {
  const { data: recentOrders, isLoading } = useGetOrdersQuery();
  const { data: productData } = useGetProductsQuery({ pageNumber: 1 });
  const { data: users } = useGetUsersQuery();

  const orders = recentOrders || [];
  const paidOrders = orders.filter((order) => order.isPaid);
  const openOrders = orders.filter((order) => !order.isDelivered);
  const revenue = paidOrders.reduce((acc, order) => acc + Number(order.totalPrice || 0), 0);

  const metrics = [
    { title: 'Paid Revenue', value: `$${revenue.toFixed(2)}`, icon: <FaChartLine />, trend: `${paidOrders.length} paid` },
    { title: 'Open Orders', value: openOrders.length, icon: <FaClipboardList />, trend: `${orders.length} total` },
    { title: 'Products Live', value: productData?.products?.length || 0, icon: <FaBoxOpen />, trend: 'Catalog' },
    { title: 'Customers', value: users?.length || 0, icon: <FaUsers />, trend: 'Accounts' },
  ];

  return (
    <div className="admin-shell animate-fade-in">
      <div className="admin-header">
        <div>
          <h1>Control Center</h1>
          <p>Live overview of your store, orders, users, catalog, and payment states.</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/productlist" className="admin-chip">
            Manage Products
          </Link>
          <Link to="/admin/orderlist" className="admin-chip">
            View Orders
          </Link>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-left">
          <div className="admin-metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.title} className="admin-metric-card glass">
                <div className="admin-metric-top">
                  <div className="admin-metric-icon">{metric.icon}</div>
                  <span className="admin-metric-trend trend-flat">{metric.trend}</span>
                </div>
                <h3>{metric.title}</h3>
                <p>{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="admin-shortcuts glass">
            <h2>Quick actions</h2>
            <div className="admin-shortcuts-grid">
              <Link to="/admin/productlist" className="admin-shortcut">
                <span className="icon"><FaBoxOpen /></span>
                <div>
                  <h3>Products</h3>
                  <p>Inventory, pricing, visibility</p>
                </div>
              </Link>
              <Link to="/admin/orderlist" className="admin-shortcut">
                <span className="icon"><FaClipboardList /></span>
                <div>
                  <h3>Orders</h3>
                  <p>Fulfillment and payment review</p>
                </div>
              </Link>
              <Link to="/admin/userlist" className="admin-shortcut">
                <span className="icon"><FaUsers /></span>
                <div>
                  <h3>Users</h3>
                  <p>Accounts and roles</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-right glass">
          <div className="admin-right-header">
            <div>
              <h2>Recent orders</h2>
              <p>Latest activity across your storefront.</p>
            </div>
            <Link to="/admin/orderlist">View all</Link>
          </div>

          <div className="admin-orders">
            {isLoading ? (
              <div className="admin-loader">
                <div className="spinner" />
              </div>
            ) : (
              <table>
                <tbody>
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order._id}>
                      <td className="code">#{order._id.substring(order._id.length - 6)}</td>
                      <td>{order.user?.name || 'Guest'}</td>
                      <td>{order.createdAt.substring(0, 10)}</td>
                      <td className="amount">${order.totalPrice}</td>
                      <td className="link-cell">
                        <Link to={`/admin/order/${order._id}`}>Review</Link>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">
                        No recent activity yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
