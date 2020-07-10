import React from 'react';
import { Link } from 'react-router-dom';

import './button.scss';

const Button = ({ variant, to, onClick, children, className, type }) =>
  to ? (
    <Link to={to} className={`button ${variant ? `button-${variant}` : ''} ${className || ''}`}>
      {children}
    </Link>
  ) : (
    <button
      type={type || 'button'}
      className={`button ${variant ? `button-${variant}` : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

export default Button;
