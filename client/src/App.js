import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import API from './api';
import history from './history';
import UserContext from './user-context';

import './App.scss';

import Login from './pages/login';
import Home from './pages/home';
import Landing from './pages/landing';
import Fight from './pages/fight';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      user: {},
    };
  }

  componentWillMount() {
    API.currentUser().then(
      (user) =>
        this.setState(
          { user },
          () =>
            (history.location.pathname === '/login' || history.location.pathname === '/signup') &&
            (window.location.href = '/dashboard')
        ),
      (err) =>
        err.status === API.UNAUTHORIZED &&
        history.location.pathname !== '/login' &&
        history.location.pathname !== '/signup' &&
        history.location.pathname !== '/' &&
        (window.location.href = '/login')
    );
  }

  render() {
    const { user } = this.state;
    return (
      <UserContext.Provider value={user}>
        <Router history={history}>
          <div className="app-container surface-0">
            <Switch>
              <Route path="/fights/:action/:id" component={Fight} />
              <Route path="/fights/:action" component={Fight} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={(props) => <Login formType="signup" {...props} />} />
              <Route path="/dashboard" component={Home} />
              <Route path="/" component={Landing} />
            </Switch>
          </div>
        </Router>
      </UserContext.Provider>
    );
  }
}
