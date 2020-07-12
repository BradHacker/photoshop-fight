import React from 'react';
import Nav from '../components/nav';
import UserContext from '../user-context';
import Card from '../components/card';
import User from '../assets/user.png';

import './home.scss';
import ActionButton from '../components/action-button';

export default class Home extends React.Component {
  static contextType = UserContext;

  constructor() {
    super();

    this.state = {};
  }

  render() {
    const user = this.context;
    return (
      <>
        <Nav user={user} />
        <div className="container home-container">
          <Card className="user-card">
            <img src={User} className="user-pfp" alt="Profile" />
            <p className="username headline4">{user.username}</p>
            <p className="name subtitle1">
              aka. {user.firstName} {user.lastName}
            </p>
          </Card>
          <Card className="fight-stats">
            <div className="stat">
              <span className="label headline5">Total Fights</span>
              <span className="number headline4">12</span>
            </div>
            <div className="stat">
              <span className="label headline5">W/L ratio</span>
              <span className="number headline4">52%</span>
            </div>
            <div className="stat">
              <span className="label headline5">Followers</span>
              <span className="number headline4">42.3k</span>
            </div>
          </Card>
          <ActionButton to="/fights/new" />
        </div>
      </>
    );
  }
}
