import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-card-image">
                <img src={product.image} alt={product.name} />
                <div className="product-card-overlay">
                    <span className="product-card-cta">View details</span>
                </div>
            </Link>

            <div className="product-card-body">
                <div className="product-card-meta">
                    <span>{product.brand}</span>
                    <span>{product.category}</span>
                </div>

                <h3 className="product-card-title">
                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                </h3>

                <div className="product-card-rating">
                    <div className="product-card-stars">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={i < Math.floor(product.rating) ? 'fill-current' : 'fill-current'}
                                width="14"
                                height="14"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span>({product.numReviews})</span>
                </div>

                <div className="product-card-bottom">
                    <div>
                        <span className="product-card-label">Price</span>
                        <div className="product-card-price">${product.price}</div>
                    </div>
                    <span className={`stock-pill ${product.countInStock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.countInStock > 0 ? 'In stock' : 'Sold out'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
