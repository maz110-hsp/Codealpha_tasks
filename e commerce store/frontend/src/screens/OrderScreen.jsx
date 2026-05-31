import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaReceipt, FaTruck, FaUniversity } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetOrderDetailsQuery, usePayOrderMutation } from '../slices/ordersApiSlice';

const getCardBrand = (number) => {
  const cleaned = number.replace(/\D/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  return 'Card';
};

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const paymentIcon = useMemo(() => {
    if (order?.paymentMethod === 'Bank Transfer') return <FaUniversity />;
    if (order?.paymentMethod === 'Credit/Debit Card') return <FaCreditCard />;
    return <FaMoneyBillWave />;
  }, [order?.paymentMethod]);

  const cardPayHandler = async (e) => {
    e.preventDefault();
    const cleanCard = cardNumber.replace(/\D/g, '');

    if (cleanCard.length < 12 || !expiry.trim() || cvv.trim().length < 3) {
      toast.error('Please enter valid demo card details.');
      return;
    }

    try {
      await payOrder({
        orderId,
        details: {
          id: `CARD-DEMO-${Date.now()}`,
          status: 'APPROVED',
          update_time: new Date().toISOString(),
          payer: { email_address: order.user.email },
          cardBrand: getCardBrand(cleanCard),
          cardLast4: cleanCard.slice(-4),
        },
      }).unwrap();
      toast.success('Card payment approved');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        {error?.data?.message || 'Error occurred loading order details'}
      </div>
    );
  }

  return (
    <div className="order-page animate-fade-in">
      <div className="order-title-row">
        <div>
          <span className="eyebrow">Order activity</span>
          <h1>Order #{order._id.substring(order._id.length - 8)}</h1>
        </div>
        <Link to="/profile" className="btn-pill">Back to Profile</Link>
      </div>

      <div className="order-status-strip">
        <div className={order.isPaid ? 'complete' : ''}>
          <FaReceipt />
          <span>{order.isPaid ? 'Payment complete' : order.paymentDetails?.status || 'Payment pending'}</span>
        </div>
        <div className={order.isDelivered ? 'complete' : ''}>
          <FaTruck />
          <span>{order.isDelivered ? 'Delivered' : 'Preparing shipment'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <section className="glass detail-panel">
            <h2>Shipping Details</h2>
            <p><strong>Name:</strong> {order.user.name}</p>
            <p><strong>Email:</strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <div className={`status-note ${order.isDelivered ? 'success' : 'warning'}`}>
              {order.isDelivered ? <FaCheckCircle /> : <FaTruck />}
              {order.isDelivered ? `Delivered on ${order.deliveredAt.substring(0, 10)}` : 'Not delivered yet'}
            </div>
          </section>

          <section className="glass detail-panel">
            <h2>Payment Method</h2>
            <div className="method-line">
              <span className="method-icon">{paymentIcon}</span>
              <div>
                <strong>{order.paymentMethod}</strong>
                <p>{order.paymentDetails?.instructions}</p>
              </div>
            </div>

            {order.paymentMethod === 'Bank Transfer' && (
              <div className="bank-box">
                <span>{order.paymentDetails?.bankName}</span>
                <strong>{order.paymentDetails?.accountTitle}</strong>
                <code>{order.paymentDetails?.accountNumber}</code>
                {order.paymentDetails?.reference && <small>Reference: {order.paymentDetails.reference}</small>}
              </div>
            )}

            <div className={`status-note ${order.isPaid ? 'success' : 'danger'}`}>
              {order.isPaid ? <FaCheckCircle /> : <FaReceipt />}
              {order.isPaid ? `Paid on ${order.paidAt.substring(0, 10)}` : 'Payment pending'}
            </div>
          </section>

          <section className="glass detail-panel">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.orderItems.map((item) => (
                <div key={item.product} className="order-item-row">
                  <img src={item.image} alt={item.name} />
                  <Link to={`/product/${item.product}`}>{item.name}</Link>
                  <strong>{item.qty} x ${item.price}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="md:col-span-1">
          <div className="glass summary-panel">
            <h2>Order Summary</h2>
            <div className="summary-lines">
              <p><span>Items</span><strong>${order.itemsPrice}</strong></p>
              <p><span>Shipping</span><strong>${order.shippingPrice}</strong></p>
              <p><span>Tax</span><strong>${order.taxPrice}</strong></p>
              <p className="summary-total"><span>Total</span><strong>${order.totalPrice}</strong></p>
            </div>

            {!order.isPaid && order.paymentMethod === 'Credit/Debit Card' && (
              <form onSubmit={cardPayHandler} className="card-payment-form">
                <h3>Authorize Card</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="card-payment-grid">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loadingPay}>
                  {loadingPay ? 'Authorizing...' : 'Pay with Card'}
                </button>
              </form>
            )}

            {!order.isPaid && order.paymentMethod === 'Bank Transfer' && (
              <div className="checkout-note">
                Admin will mark this order paid after the transfer is verified.
              </div>
            )}

            {!order.isPaid && order.paymentMethod === 'Cash on Delivery' && (
              <div className="checkout-note">
                Payment will be collected when the package is delivered.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderScreen;
