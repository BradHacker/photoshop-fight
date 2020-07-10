import React from 'react';
import Logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';

import User from '../assets/user.png';
import './nav.scss';

const Nav = ({ user, collapsed }) => (
  <nav className="nav">
    <Link to="/">
      <img src={Logo} className="logo surface-1" alt="Logo" />
    </Link>
    <img src={User} className="user-pfp surface-1" alt="Profile" />
  </nav>
);

export default Nav;
