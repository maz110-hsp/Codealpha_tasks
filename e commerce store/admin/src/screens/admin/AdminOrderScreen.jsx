import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBoxOpen, FaCheck, FaClipboardList, FaCreditCard, FaTruck, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
} from '../../slices/ordersApiSlice';

const AdminOrderScreen = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const markPaidHandler = async () => {
    try {
      await payOrder({
        orderId,
        details: {
          id: `ADMIN-${Date.now()}`,
          status: 'MANUALLY_APPROVED',
          update_time: new Date().toISOString(),
          payer: { email_address: order.user.email },
        },
      }).unwrap();
      toast.success('Payment marked as paid');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      toast.success('Order marked as delivered');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="alert-error">{error?.data?.message || error.error}</div>;
  }

  return (
    <div className="admin-shell animate-fade-in">
      <Link to="/admin/orderlist" className="btn-pill inline-flex items-center gap-2">
        <FaArrowLeft /> Orders
      </Link>

      <div className="admin-header">
        <div>
          <h1>Order #{order._id.substring(order._id.length - 8)}</h1>
          <p>Review customer, fulfillment, and payment activity.</p>
        </div>
        <div className="admin-header-actions">
          {!order.isPaid && (
            <button className="admin-chip" type="button" onClick={markPaidHandler} disabled={loadingPay}>
              <FaCreditCard /> {loadingPay ? 'Updating...' : 'Mark paid'}
            </button>
          )}
          {order.isPaid && !order.isDelivered && (
            <button className="admin-chip" type="button" onClick={deliverOrderHandler} disabled={loadingDeliver}>
              <FaTruck /> {loadingDeliver ? 'Updating...' : 'Mark delivered'}
            </button>
          )}
        </div>
      </div>

      <div className="admin-order-grid">
        <section className="glass admin-detail-card">
          <h2><FaUser /> Customer</h2>
          <p><strong>Name</strong>{order.user.name}</p>
          <p><strong>Email</strong><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
          <p>
            <strong>Ship to</strong>
            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>
        </section>

        <section className="glass admin-detail-card">
          <h2><FaCreditCard /> Payment</h2>
          <p><strong>Method</strong>{order.paymentMethod}</p>
          <p><strong>Status</strong>{order.isPaid ? `Paid on ${order.paidAt.substring(0, 10)}` : order.paymentResult?.status || 'Pending'}</p>
          {order.paymentDetails?.instructions && <p><strong>Notes</strong>{order.paymentDetails.instructions}</p>}
        </section>

        <section className="glass admin-detail-card">
          <h2><FaTruck /> Fulfillment</h2>
          <p><strong>Delivery</strong>{order.isDelivered ? `Delivered on ${order.deliveredAt.substring(0, 10)}` : 'Awaiting fulfillment'}</p>
          <p><strong>Total</strong>${order.totalPrice}</p>
        </section>
      </div>

      <section className="glass admin-detail-card">
        <h2><FaClipboardList /> Items</h2>
        <div className="admin-line-items">
          {order.orderItems.map((item) => (
            <div className="admin-line-item" key={item.product}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.qty} x ${item.price}</p>
              </div>
              <strong>${(item.qty * item.price).toFixed(2)}</strong>
            </div>
          ))}
          {order.orderItems.length === 0 && (
            <div className="admin-empty-inline">
              <FaBoxOpen /> No items found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminOrderScreen;
