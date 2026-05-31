import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
    const { id: productId } = useParams();
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
    const { userInfo } = useSelector((state) => state.auth);

    const [createReview, { isLoading: loadingReview }] = useCreateReviewMutation();

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));
        navigate('/cart');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await createReview({ productId, rating, comment }).unwrap();
            refetch();
            toast.success('Review submitted successfully');
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center my-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-color"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-danger/20 text-danger p-6 rounded-xl my-8 glass text-center border-danger/30">
                <span className="font-semibold block text-xl mb-2">Error Loading Product</span>
                {error?.data?.message || error.error}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <Link to="/" className="inline-block mb-8 text-slate-300 hover:text-white transition-colors bg-surface-color/50 px-6 py-2 rounded-full border border-white/10 hover:border-white/30">
                &larr; Back to Shop
            </Link>

            <div className="product-layout">
                {/* Product Image Gallery */}
                <div className="product-media glass">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-color/5 to-secondary-color/5 z-0"></div>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-media-img"
                    />
                </div>

                {/* Product Details */}
                <div className="product-details">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-warning text-lg">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-600 fill-current'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-slate-400 font-medium">{product.numReviews} Reviews</span>
                    </div>

                    <div className="text-4xl font-black text-gradient mb-8">${product.price}</div>

                    <p className="text-slate-300 text-lg leading-relaxed mb-10">
                        {product.description}
                    </p>

                    <div className="glass p-8 rounded-2xl border border-white/10 mt-auto">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                            <span className="text-lg font-medium text-slate-300">Status</span>
                            <span className={`text-lg font-bold ${product.countInStock > 0 ? 'text-success' : 'text-danger'}`}>
                                {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                            </span>
                        </div>

                        {product.countInStock > 0 && (
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-medium text-slate-300">Quantity</span>
                                <select
                                    className="bg-surface-color text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-color"
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                >
                                    {[...Array(product.countInStock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl ${product.countInStock === 0
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                                    : 'bg-gradient-to-r from-primary-color to-secondary-color text-white hover:shadow-primary-color/50 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                            disabled={product.countInStock === 0}
                            onClick={addToCartHandler}
                        >
                            Add To Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="glass p-8 rounded-2xl border border-white/5">
                    <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
                    {product.reviews.length === 0 ? (
                        <div className="p-6 bg-white/5 rounded-xl text-slate-400">No reviews yet. Be the first to review!</div>
                    ) : (
                        <div className="space-y-6">
                            {product.reviews.map((review) => (
                                <div key={review._id} className="p-6 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-start mb-3">
                                        <strong className="text-slate-100">{review.name}</strong>
                                        <div className="flex text-warning text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-600 fill-current'}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-2">{review.createdAt.substring(0, 10)}</p>
                                    <p className="text-slate-300">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass p-8 rounded-2xl border border-white/5">
                    <h2 className="text-2xl font-bold mb-8">Write a Review</h2>
                    {loadingReview && <div className="loading-spinner scale-50" />}

                    {userInfo ? (
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="auth-field">
                                <label>Rating</label>
                                <select
                                    className="w-full bg-surface-color text-white border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                >
                                    <option value="">Select...</option>
                                    <option value="1">1 - Poor</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="3">3 - Good</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="5">5 - Excellent</option>
                                </select>
                            </div>
                            <div className="auth-field">
                                <label>Comment</label>
                                <textarea
                                    className="w-full bg-surface-color text-white border border-white/20 rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:border-primary-color"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingReview}
                                className="btn-pill btn-pill-primary w-full justify-center py-4 font-bold"
                            >
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="p-8 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-slate-400 mb-4">Please sign in to write a review.</p>
                            <Link to="/login" className="btn-pill inline-flex">Sign In</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
