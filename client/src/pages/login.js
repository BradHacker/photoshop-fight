import React from 'react';

import Logo from '../assets/logo.svg';
import './login.scss';
import api from '../api';
import Button from '../components/button';
import history from '../history';

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      formType: props.formType || 'login',
    };

    this.onUsername = this.onUsername.bind(this);
    this.onPassword = this.onPassword.bind(this);
    this.onFirstName = this.onFirstName.bind(this);
    this.onLastName = this.onLastName.bind(this);
    this.toggleFormType = this.toggleFormType.bind(this);
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

  toggleFormType(postSignup) {
    const { formType } = this.state;
    this.setState({
      formType: formType === 'login' ? 'signup' : 'login',
      postSignup,
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      error: undefined,
    });
    history.push(`/${formType === 'login' ? 'signup' : 'login'}`);
  }

  onSubmit(e) {
    e.preventDefault();
    const { username, password, firstName, lastName, formType } = this.state;

    if (formType === 'login')
      api.login({ username, password }).then(
        () => (window.location.href = '/dashboard'),
        (err) => this.setState({ error: { ...err } })
      );
    else
      api.register({ firstName, lastName, username, password }).then(
        () => this.toggleFormType(true),
        (err) => this.setState({ error: { ...err } })
      );
  }

  render() {
    const { username, password, firstName, lastName, error, formType, postSignup } = this.state;

    return (
      <div className="login-container">
        <img src={Logo} className="logo" alt="Logo" />
        <form className={`form-fluid ${formType === 'login' ? 'open' : 'collapsed'}`} onSubmit={this.onSubmit}>
          <h2 className="form-title headline4">Login</h2>
          {error && <div className="error">{error.message || 'An unknown error has ocurred'}</div>}
          {postSignup && <div className="postSignup">Signup Success, now please login</div>}
          <div className="form-group form-group-fluid">
            <label htmlFor="username" className="headline6">
              Username
            </label>
            <input type="text" id="username" onChange={this.onUsername} value={username} placeholder="Username" />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="password" className="headline6">
              Password
            </label>
            <input type="password" id="password" onChange={this.onPassword} value={password} placeholder="Password" />
          </div>
          <div className="controls">
            <Button type="submit">Login</Button>
            <Button onClick={() => this.toggleFormType()} variant="text">
              Sign Up
            </Button>
          </div>
        </form>
        <form className={`form-fluid ${formType === 'signup' ? 'open' : 'collapsed'}`} onSubmit={this.onSubmit}>
          <h2 className="form-title headline4">Sign Up</h2>
          {error && <div className="error">{error.message || 'An unknown error has ocurred'}</div>}
          <div className="form-group form-group-fluid">
            <label htmlFor="firstName" className="headline6">
              First Name
            </label>
            <input type="text" id="firstName" onChange={this.onFirstName} value={firstName} placeholder="First Name" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="lastName" className="headline6">
              Last Name
            </label>
            <input type="text" id="lastName" onChange={this.onLastName} value={lastName} placeholder="Last Name" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="username" className="headline6">
              Username
            </label>
            <input type="text" id="username" onChange={this.onUsername} value={username} placeholder="Username" required />
          </div>
          <div className="form-group form-group-fluid">
            <label htmlFor="password" className="headline6">
              Password
            </label>
            <input type="password" id="password" onChange={this.onPassword} value={password} placeholder="Password" required />
          </div>
          <div className="controls">
            <Button type="submit">Sign Up</Button>
            <Button onClick={() => this.toggleFormType()} variant="text">
              Login
            </Button>
          </div>
        </form>
      </div>
    );
  }
}
