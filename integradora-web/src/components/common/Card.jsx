import React from 'react';

const Card = ({ children, title, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white border-gray-100',
    elevated: 'bg-white border-gray-200 shadow-lg',
    flat: 'bg-gray-50 border-gray-200',
    bordered: 'bg-white border-2 border-gray-200'
  };

  return (
    <div className={`rounded-xl border ${variants[variant]} transition-all duration-200 hover:shadow-md ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
      )}
      <div className={`text-gray-700 ${title ? 'p-6' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;