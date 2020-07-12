import React, { useContext } from 'react';
import Logo from '../assets/logo.svg';
import User from '../assets/user.png';

import './landing.scss';
import Button from '../components/button';
import UserContext from '../user-context';

const Landing = () => {
  const user = useContext(UserContext);
  return (
    <div className="landing-container">
      <nav className="landing-nav surface-0-flat">
        <img src={Logo} className="logo surface-1" alt="logo" />
        <Button to={user.hashid ? '/dashboard' : '/login'} variant="text">
          {user.hashid ? 'Dashboard' : 'Login'}
        </Button>
        {user.hashid ? <img src={User} className="user-pfp surface-1" alt="Profile" /> : <Button to="/signup">Sign Up</Button>}
      </nav>
      <div className="container hero-container surface-0-flat">
        <img src={Logo} className="logo surface-1" alt="logo" />
        <div className="app-title">
          <p className="photoshop headline1">Photoshop</p>
          <p className="fight headline1">Fight</p>
          <p className="tagline headline5">The dedicated place for your Photoshop Battles</p>
        </div>
        <p className="scroll">
          <i className="fa fa-chevron-down" />
          Scroll For More
        </p>
      </div>
      <div className="container works-container surface-1">
        <p className="headline2">How It Works</p>
        <p className="headline4">1) Create An Account</p>
        <p className="headline4">2) Start a photoshop fight</p>
        <p className="headline4">3) Share the fight link with your friends</p>
        <p className="headline4">4) Win</p>
      </div>
      <div className="container get-started-container surface-0-flat">
        <p className="headline2">{user.hashid ? 'Go to your Dashboard' : 'Get Started Today!'}</p>
        <div className="buttons">
          <Button to={user.hashid ? '/dashboard' : '/signup'}>{user.hashid ? 'Dashboard' : 'Sign Up'}</Button>
          {!user.hashid && (
            <Button to="/login" variant="text">
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
