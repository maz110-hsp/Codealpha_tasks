import React from 'react';
import { Link } from 'react-router-dom';
import { FaLaptop, FaHeadphones, FaCamera, FaGamepad } from 'react-icons/fa';

const categories = [
    { name: 'Computers', description: 'Portable power and pro workstations', icon: <FaLaptop size={32} />, path: '/search/laptop' },
    { name: 'Audio', description: 'Immersive sound for work and play', icon: <FaHeadphones size={32} />, path: '/search/headphones' },
    { name: 'Photography', description: 'Sharp cameras and visual tools', icon: <FaCamera size={32} />, path: '/search/camera' },
    { name: 'Gaming', description: 'Responsive gear for serious sessions', icon: <FaGamepad size={32} />, path: '/search/gaming' },
];

const CategoryShowcase = () => {
    return (
        <div className="category-section">
            <div className="category-header">
                <div>
                    <span className="section-kicker">Collections</span>
                    <h2 className="section-title">
                        Shop by <span className="text-gradient">Category</span>
                    </h2>
                </div>
                <p className="section-subtitle">Jump straight into the gear your customers expect to find first.</p>
            </div>

            <div className="category-grid">
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        to={cat.path}
                        className="category-card"
                    >
                        <div className="category-card-icon">
                            {cat.icon}
                        </div>
                        <h3 className="category-card-title">{cat.name}</h3>
                        <p>{cat.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryShowcase;
