import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  type = 'button',
  style = {}
}) => {
  const variants = {
    primary: { backgroundColor: '#3498db', color: 'white' },
    success: { backgroundColor: '#27ae60', color: 'white' },
    danger: { backgroundColor: '#e74c3c', color: 'white' },
    warning: { backgroundColor: '#f39c12', color: 'white' },
    secondary: { backgroundColor: '#95a5a6', color: 'white' }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        ...variants[variant],
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default Button;