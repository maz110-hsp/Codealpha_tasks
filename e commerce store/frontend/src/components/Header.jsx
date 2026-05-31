import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaUser, FaCaretDown, FaSearch } from 'react-icons/fa';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { ADMIN_URL } from '../constants';

const Header = ({ theme = 'dark', onToggleTheme }) => {
    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    const [keyword, setKeyword] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/search/${keyword}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="site-header">
            <div className="promo-bar">
                <span>Free delivery on orders over $100</span>
                <span>Secure checkout</span>
                <span>7-day support</span>
            </div>
            <div className="container site-header-inner">
                {/* Logo */}
                <Link to="/" className="site-logo">
                    <span>PRO</span>Store
                </Link>

                {/* Desktop Search */}
                <form onSubmit={submitHandler} className="site-search">
                    <input
                        type="text"
                        placeholder="Search premium tech..."
                        onChange={(e) => setKeyword(e.target.value)}
                        value={keyword}
                    />
                    <button type="submit">
                        <FaSearch />
                    </button>
                </form>

                {/* Navigation */}
                <nav className="site-nav">
                    <Link to="/cart" className="nav-link nav-cart">
                        <FaShoppingCart />
                        <span>Cart</span>
                        {cartItems.length > 0 && (
                            <span className="nav-cart-count">
                                {cartItems.reduce((a, c) => a + c.qty, 0)}
                            </span>
                        )}
                    </Link>

                    {userInfo ? (
                        <div className="dropdown">
                            <button
                                onClick={() => {
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowAdminMenu(false);
                                }}
                                className="btn-pill"
                            >
                                <FaUser />
                                <span>{userInfo.name}</span>
                                <FaCaretDown />
                            </button>

                            {showProfileMenu && (
                                <div className="dropdown-menu">
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={logoutHandler}
                                        className="dropdown-item dropdown-item-danger"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-pill btn-pill-primary">
                            <FaUser /> Sign In
                        </Link>
                    )}

                    {/* Theme toggle */}
                    {onToggleTheme && (
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            className="btn-pill"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                    )}

                    {userInfo && userInfo.isAdmin && (
                        <div className="dropdown">
                            <button
                                onClick={() => {
                                    setShowAdminMenu(!showAdminMenu);
                                    setShowProfileMenu(false);
                                }}
                                className="btn-pill"
                            >
                                Admin <FaCaretDown />
                            </button>

                            {showAdminMenu && (
                                <div className="dropdown-menu">
                                    <a
                                        href={`${ADMIN_URL}/admin/dashboard`}
                                        className="dropdown-item"
                                        onClick={() => setShowAdminMenu(false)}
                                    >
                                        Dashboard
                                    </a>
                                    <a
                                        href={`${ADMIN_URL}/admin/productlist`}
                                        className="dropdown-item"
                                        onClick={() => setShowAdminMenu(false)}
                                    >
                                        Products
                                    </a>
                                    <a
                                        href={`${ADMIN_URL}/admin/orderlist`}
                                        className="dropdown-item"
                                        onClick={() => setShowAdminMenu(false)}
                                    >
                                        Orders
                                    </a>
                                    <a
                                        href={`${ADMIN_URL}/admin/userlist`}
                                        className="dropdown-item"
                                        onClick={() => setShowAdminMenu(false)}
                                    >
                                        Users
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            {/* Mobile Search */}
            <div className="container mobile-search">
                <form onSubmit={submitHandler}>
                    <input
                        type="text"
                        placeholder="Search premium tech..."
                        onChange={(e) => setKeyword(e.target.value)}
                        value={keyword}
                    />
                    <button type="submit">
                        <FaSearch />
                    </button>
                </form>
            </div>
        </header>
    );
};

export default Header;
