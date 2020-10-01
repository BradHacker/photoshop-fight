import React from 'react';
import Logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import Button from '../components/button';

import User from '../assets/user.png';
import './nav.scss';

const Nav = ({ user, variant, children }) => (
  <nav className={`nav ${variant === 'solid' ? 'surface-1' : ''}`}>
    <Link to="/">
      <img src={Logo} className="logo surface-1" alt="Logo" />
    </Link>
    {children}
    <Button to="/dashboard" variant="text">
      Dashboard
    </Button>
    <img src={(user && user.image) || User} className="user-pfp" alt="Profile" />
  </nav>
);

export default Nav;
