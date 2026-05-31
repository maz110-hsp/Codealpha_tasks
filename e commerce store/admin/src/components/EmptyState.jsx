import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
    title = 'Nothing to see here',
    message = 'Looks like there is no data to display right now.',
    icon: Icon,
    actionText,
    actionLink
}) => {
    return (
        <div className="empty-state-container animate-fade-in relative w-full">
            <div className="empty-state-card glass text-center group">
                <div className="empty-state-glow"></div>

                {Icon && (
                    <div className="empty-state-icon-wrapper">
                        <div className="empty-state-icon-inner">
                            <Icon className="empty-state-icon" />
                        </div>
                    </div>
                )}

                <h2 className="empty-state-title relative">
                    {title.split(' ').map((word, i, arr) => (
                        i === arr.length - 1 ? <span key={i} className="text-gradient"> {word}</span> : <span key={i}>{word} </span>
                    ))}
                </h2>
                
                <p className="empty-state-message relative">
                    {message}
                </p>

                {actionText && actionLink && (
                    <Link
                        to={actionLink}
                        className="btn-primary empty-state-btn relative"
                    >
                        {actionText}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
