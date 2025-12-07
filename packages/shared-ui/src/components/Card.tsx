import React from 'react';

export interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', onClick }) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-md p-6 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={onClick}
        >
            {title && <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>}
            <div className="text-gray-600">{children}</div>
        </div>
    );
};
