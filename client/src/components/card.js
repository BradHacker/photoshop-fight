import React from 'react';

import './card.scss';

const Card = ({ level, className, children }) => <div className={`card surface-${level || 1} ${className}`}>{children}</div>;

export default Card;
