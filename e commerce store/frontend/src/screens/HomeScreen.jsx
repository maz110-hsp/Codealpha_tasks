import React from 'react';
import { useParams } from 'react-router-dom';
import { FaCreditCard, FaHeadset, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';

const HomeScreen = () => {
    const { keyword } = useParams();
    const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber: 1 });

    return (
        <>
            <Hero />
            <section className="trust-strip">
              <div className="trust-item">
                <FaTruck />
                <div>
                  <strong>Fast delivery</strong>
                  <span>Free over $100</span>
                </div>
              </div>
              <div className="trust-item">
                <FaShieldAlt />
                <div>
                  <strong>Safe orders</strong>
                  <span>Protected checkout</span>
                </div>
              </div>
              <div className="trust-item">
                <FaCreditCard />
                <div>
                  <strong>Flexible payment</strong>
                  <span>COD, bank, card</span>
                </div>
              </div>
              <div className="trust-item">
                <FaHeadset />
                <div>
                  <strong>Support desk</strong>
                  <span>Help after purchase</span>
                </div>
              </div>
            </section>
            <CategoryShowcase />

      <div className="section-header featured-header" id="featured-products">
        <div>
          <span className="section-kicker">{keyword ? 'Search results' : 'Curated catalog'}</span>
          <h2 className="section-title">
            {keyword ? 'Matching' : 'Featured'} <span className="text-gradient">Products</span>
          </h2>
        </div>
        <p className="section-subtitle">
          {keyword ? `Results for "${keyword}"` : 'Premium electronics presented with clear pricing, stock status, and quick product discovery.'}
        </p>
      </div>

      {isLoading ? (
        <div className="loading-spinner" />
      ) : error ? (
        <div className="alert-error">
          <strong>Oops! Something went wrong</strong>
          {error?.data?.message || error.error}
        </div>
      ) : (
        <div className="products-grid">
          {data?.products?.map((product, index) => (
            <div
              key={product._id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
        </>
    );
};

export default HomeScreen;
