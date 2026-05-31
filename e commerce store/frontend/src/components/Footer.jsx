import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="site-footer-top">
                    {/* Brand Info */}
                    <div>
                        <h3 className="section-title">
                            <span className="text-gradient">PRO</span>Store
                        </h3>
                        <p className="hero-subtitle">
                            The premier destination for high-end electronics. We curate only the absolute best technology for professionals who demand excellence in their craft.
                        </p>
                        <div className="footer-social">
                            <a href="#">
                                <FaFacebook size={18} />
                            </a>
                            <a href="#">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#">
                                <FaTwitter size={18} />
                            </a>
                            <a href="#">
                                <FaYoutube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="section-title" style={{ fontSize: '1rem' }}>Contact Us</h4>
                        <ul className="footer-list">
                            <li>
                                <FaMapMarkerAlt /> 123 Tech Avenue, Suite 400, San Francisco, CA 94107
                            </li>
                            <li>
                                <FaPhone /> +1 (800) 123-4567
                            </li>
                            <li>
                                <FaEnvelope /> support@prostore.com
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="section-title" style={{ fontSize: '1rem' }}>Helpful Links</h4>
                        <ul className="footer-list">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/shipping-policy">Shipping &amp; Returns</Link></li>
                            <li><Link to="/warranty">Warranty Info</Link></li>
                            <li><Link to="/contact">Customer Support</Link></li>
                            <li><Link to="/faq">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-newsletter">
                        <h4 className="section-title" style={{ fontSize: '1rem' }}>Stay Updated</h4>
                        <p className="hero-subtitle">
                            Subscribe to our newsletter for exclusive deals, new product drops, and insider news.
                        </p>
                        <form className="footer-newsletter-form">
                            <input type="email" placeholder="Enter your email" />
                            <button type="button">Join</button>
                        </form>
                    </div>
                </div>

                <div className="site-footer-bottom">
                    <p>&copy; {currentYear} PROStore. All rights reserved.</p>
                    <div>
                        <Link to="/privacy" style={{ marginRight: '1rem' }}>Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
