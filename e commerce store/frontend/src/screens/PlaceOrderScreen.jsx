import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);

    const [createOrder, { isLoading, error }] = useCreateOrderMutation();

    useEffect(() => {
        if (!cart.shippingAddress.address) {
            navigate('/shipping');
        } else if (!cart.paymentMethod) {
            navigate('/payment');
        }
    }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

    const placeOrderHandler = async () => {
        try {
            const res = await createOrder({
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                paymentDetails: cart.paymentDetails,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            }).unwrap();
            dispatch(clearCartItems());
            navigate(`/order/${res._id}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in py-4">
            <h1 className="text-4xl font-extrabold mb-10 tracking-tight">
                Confirm <span className="text-gradient">Order</span>
            </h1>
            <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                    <div className="glass p-8 rounded-2xl border border-white/5 shadow-lg group hover:border-white/10 transition-colors">
                        <h2 className="text-2xl font-bold mb-4 text-white">Shipping Information</h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            <strong className="text-white block mb-1">Address Location:</strong>
                            {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                            {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                        </p>
                    </div>

                    <div className="glass p-8 rounded-2xl border border-white/5 shadow-lg group hover:border-white/10 transition-colors">
                        <h2 className="text-2xl font-bold mb-4 text-white">Payment Method</h2>
                        <p className="text-lg text-slate-300">
                            <strong className="text-white">Selected Gateway: </strong>
                            <span className="payment-badge">{cart.paymentMethod}</span>
                        </p>
                        {cart.paymentMethod === 'Bank Transfer' && cart.paymentDetails?.reference && (
                            <p className="text-sm text-slate-400 mt-4">Reference: {cart.paymentDetails.reference}</p>
                        )}
                    </div>

                    <div className="glass p-8 rounded-2xl border border-white/5 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-white">Order Items</h2>
                        {cart.cartItems.length === 0 ? (
                            <p className="text-slate-400 italic">Your cart is empty.</p>
                        ) : (
                            <div className="space-y-4">
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-6 p-4 bg-surface-color/50 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover shadow-md" />
                                        <Link to={`/product/${item._id}`} className="flex-1 text-lg font-semibold hover:text-primary-color transition-colors line-clamp-2 leading-tight">
                                            {item.name}
                                        </Link>
                                        <div className="font-bold text-lg text-slate-300">
                                            {item.qty} x ${item.price} = <span className="text-gradient">${(item.qty * (item.price * 100)) / 100}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="glass p-8 rounded-2xl sticky top-28 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-white">Cost Breakdown</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-lg">
                                <span className="text-slate-400">Items:</span>
                                <span className="font-semibold text-white">${cart.itemsPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="text-slate-400">Shipping:</span>
                                <span className="font-semibold text-white">${cart.shippingPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="text-slate-400">Tax:</span>
                                <span className="font-semibold text-white">${cart.taxPrice}</span>
                            </div>
                            <div className="flex justify-between text-2xl pt-6 border-t border-white/10 mt-2">
                                <span className="text-slate-300 font-bold">Total:</span>
                                <span className="font-black text-gradient">${cart.totalPrice}</span>
                            </div>
                        </div>

                        {error && <div className="bg-danger/20 text-danger p-4 rounded-xl mb-6 text-sm font-bold text-center border border-danger/30">{error.data?.message || 'Error occurred during checkout'}</div>}

                        <button
                            type="button"
                            className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl ${cart.cartItems.length === 0 || isLoading
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                                    : 'bg-gradient-to-r from-primary-color to-secondary-color text-white hover:shadow-primary-color/50 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                            disabled={cart.cartItems.length === 0 || isLoading}
                            onClick={placeOrderHandler}
                        >
                            {isLoading ? 'Processing Order...' : 'Place Secure Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;
