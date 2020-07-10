import React from 'react';
import { Link } from 'react-router-dom';

import Logo from '../assets/logo.svg';
import './login.scss';
import API from '../api';
import Button from '../components/button';

export default class SignUp extends React.Component {
  constructor() {
    super();

    this.state = {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
    };

    this.onUsername = this.onUsername.bind(this);
    this.onPassword = this.onPassword.bind(this);
    this.onFirstName = this.onFirstName.bind(this);
    this.onLastName = this.onLastName.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onUsername(e) {
    const { value } = e.target;
    this.setState({ username: value });
  }

  onPassword(e) {
    const { value } = e.target;
    this.setState({ password: value });
  }

  onFirstName(e) {
    const { value } = e.target;
    this.setState({ firstName: value });
  }

  onLastName(e) {
    const { value } = e.target;
    this.setState({ lastName: value });
  }

  onSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, username, password } = this.state;
    const { history } = this.props;

    API.register({ firstName, lastName, username, password }).then(
      () => history.push('/login'),
      (err) => this.setState({ error: { ...err } })
    );
  }

  render() {
    const { username, password, firstName, lastName } = this.state;

    return (
      <div className="login-container">
        <img src={Logo} className="logo" alt="Logo" />
        <form className="form-fluid" onSubmit={this.onSubmit}>
          <h2 className="form-title headline4">Sign Up</h2>
          <div className="form-group form-group-fluid">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" onChange={this.onFirstName} value={firstName} placeholder="First Name" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" onChange={this.onLastName} value={lastName} placeholder="Last Name" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" onChange={this.onUsername} value={username} placeholder="Username" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={this.onPassword} value={password} placeholder="Password" required />
          </div>
          <div className="controls">
            <Button type="submit">Sign Up</Button>
            <Button to="/login" variant="text">
              Login
            </Button>
          </div>
        </form>
      </div>
    );
  }
}
