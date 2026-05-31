import React, { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import EmptyState from '../components/EmptyState';
import { useGetProductDetailsQuery } from '../slices/productsApiSlice';

const CartScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: productId } = useParams();
    const [searchParams] = useSearchParams();
    const qty = Number(searchParams.get('qty') || 1);

    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;
    const { data: product } = useGetProductDetailsQuery(productId, {
        skip: !productId,
    });

    useEffect(() => {
        if (productId && product) {
            dispatch(addToCart({ ...product, qty }));
            navigate('/cart', { replace: true });
        }
    }, [dispatch, navigate, product, productId, qty]);

    const addToCartHandler = async (item, qty) => {
        dispatch(addToCart({ ...item, qty }));
    };

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping');
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-extrabold mb-10 tracking-tight">
                Shopping <span className="text-gradient">Cart</span>
            </h1>

            {cartItems.length === 0 ? (
                <EmptyState 
                    title="Cart is Empty" 
                    message="Your cart is feeling a little empty." 
                    icon={FaShoppingCart} 
                    actionText="Discover Tech" 
                    actionLink="/" 
                />
            ) : (
                <div className="grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                        {cartItems.map((item, index) => (
                            <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
                                <div className="glass p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 relative group border border-white/5 hover:border-white/20 transition-all duration-300">
                                    <div className="bg-surface-color/50 p-2 rounded-xl flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg shadow-lg mix-blend-multiply" />
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/product/${item._id}`} className="text-lg font-bold hover:text-primary-color transition-colors line-clamp-2 leading-snug">
                                            {item.name}
                                        </Link>
                                        <p className="text-xl font-black text-gradient mt-2">${item.price}</p>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        <select
                                            value={item.qty}
                                            onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                                            className="bg-slate-800 text-white border border-white/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-color shadow-inner cursor-pointer"
                                        >
                                            {[...Array(item.countInStock).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCartHandler(item._id)}
                                            className="text-danger hover:text-red-400 p-3 bg-danger/10 hover:bg-danger/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                                            aria-label="Remove item"
                                        >
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-1">
                        <div className="glass p-8 rounded-2xl sticky top-28 border border-white/10 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-slate-400">Total Items:</span>
                                    <span className="font-semibold bg-surface-color px-3 py-1 rounded-md">{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-4 border-t border-white/5">
                                    <span className="text-slate-400">Subtotal:</span>
                                    <span className="font-black text-gradient text-3xl">${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={cartItems.length === 0}
                                onClick={checkoutHandler}
                                className="w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl bg-gradient-to-r from-primary-color to-secondary-color text-white hover:shadow-primary-color/50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Proceed To Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
