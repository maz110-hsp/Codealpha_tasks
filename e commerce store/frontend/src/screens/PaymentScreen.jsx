import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaUniversity } from 'react-icons/fa';
import { savePaymentDetails, savePaymentMethod } from '../slices/cartSlice';

const paymentOptions = [
  {
    id: 'Cash on Delivery',
    title: 'Cash on Delivery',
    description: 'Pay when the package reaches your door.',
    icon: <FaMoneyBillWave />,
  },
  {
    id: 'Bank Transfer',
    title: 'Bank Transfer',
    description: 'Send payment to the store account and keep your receipt.',
    icon: <FaUniversity />,
  },
  {
    id: 'Credit/Debit Card',
    title: 'Credit/Debit Card',
    description: 'Authorize a card payment from your order page.',
    icon: <FaCreditCard />,
  },
];

const paymentOptionIds = paymentOptions.map((option) => option.id);

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState(
    paymentOptionIds.includes(cart.paymentMethod) ? cart.paymentMethod : 'Cash on Delivery'
  );
  const [bankReference, setBankReference] = useState(cart.paymentDetails?.reference || '');

  const selectedOption = useMemo(
    () => paymentOptions.find((option) => option.id === paymentMethod),
    [paymentMethod]
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    dispatch(savePaymentDetails({
      reference: paymentMethod === 'Bank Transfer' ? bankReference.trim() : '',
    }));
    navigate('/placeorder');
  };

  return (
    <div className="payment-page animate-fade-in">
      <div className="payment-shell glass">
        <div className="payment-intro">
          <span className="eyebrow">Checkout step 2</span>
          <h1>Choose how you want to pay.</h1>
          <p>
            Pick the method that fits the order. Card payments can be authorized after the order is created, while bank and COD orders remain reviewable from your profile.
          </p>
        </div>

        <form onSubmit={submitHandler} className="payment-form">
          <div className="payment-options">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}
              >
                <input
                  id={option.id}
                  name="paymentMethod"
                  type="radio"
                  value={option.id}
                  checked={paymentMethod === option.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-option-icon">{option.icon}</span>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </div>

          <div className="payment-details-panel">
            <div className="payment-details-icon">{selectedOption?.icon}</div>
            <div>
              <h2>{selectedOption?.title}</h2>
              {paymentMethod === 'Cash on Delivery' && (
                <p>Cash will be collected by the delivery agent. Keep the exact order total ready for faster handoff.</p>
              )}
              {paymentMethod === 'Bank Transfer' && (
                <>
                  <p>Transfer the total amount to the store account, then add the reference number if you already have one.</p>
                  <div className="bank-box">
                    <span>Demo Commerce Bank</span>
                    <strong>PROStore Pvt Ltd</strong>
                    <code>PK00-DEMO-0000-0000</code>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="bankReference">Transfer reference (optional)</label>
                    <input
                      id="bankReference"
                      type="text"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="Receipt or transaction ID"
                    />
                  </div>
                </>
              )}
              {paymentMethod === 'Credit/Debit Card' && (
                <p>After placing the order, open the order detail page and authorize the card payment. Only the card brand and last four digits are saved.</p>
              )}
            </div>
          </div>

          <button type="submit" className="auth-submit">
            Continue to Order Summary
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;
