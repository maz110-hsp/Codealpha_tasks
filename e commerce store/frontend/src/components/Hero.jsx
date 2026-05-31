import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="hero">
            <img
                src="https://images.unsplash.com/photo-1550009158-9a161fdf9600?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                alt="Premium Tech Gear"
                className="hero-bg"
            />

            <div className="hero-content animate-slide-up">
                <span className="hero-badge">
                    New season tech drop
                </span>
                <h1 className="hero-title">
                    Upgrade your setup with <br />
                    <span className="text-gradient">gear that stands out.</span>
                </h1>
                <p className="hero-subtitle">
                    A polished marketplace for headphones, laptops, cameras, and gaming essentials with smooth checkout and order tracking.
                </p>
                <div className="hero-actions">
                    <Link to="/#featured-products" className="btn-primary">
                        Shop featured deals
                    </Link>
                    <Link to="/search/headphones" className="btn-secondary">
                        Explore Audio
                    </Link>
                </div>
            </div>

            <div className="hero-showcase animate-slide-up">
                <div className="hero-deal-card hero-deal-main">
                    <span>Today only</span>
                    <strong>Up to 35% off</strong>
                    <small>Selected creator gear</small>
                </div>
                <div className="hero-deal-grid">
                    <div className="hero-mini-card">
                        <span>COD</span>
                        <strong>Available</strong>
                    </div>
                    <div className="hero-mini-card">
                        <span>Orders</span>
                        <strong>Track live</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
