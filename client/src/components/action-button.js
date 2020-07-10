import React from 'react';
import { Link } from 'react-router-dom';

import './action-button.scss';

const ActionButton = ({ icon, to, onClick }) =>
  to ? (
    <Link to={to} className="action-button">
      <i className={`fa fa-${icon || 'plus'}`} />
    </Link>
  ) : (
    <button type="button" className="action-button" onClick={onClick}>
      <i className={`fa fa-${icon || 'plus'}`} />
    </button>
  );

export default ActionButton;
