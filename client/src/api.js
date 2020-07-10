/* eslint-disable one-var */

const STATUS = {
  OK: 200,
  CONTENT_CREATED: 201,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
};

const defaultHeaders = {},
  csrfHeaders = {},
  csrfTag = document.querySelector('meta[name=csrf-token]');

if (csrfTag) {
  const csrfToken = csrfTag && csrfTag.getAttribute('content');

  csrfHeaders['X-Requested-With'] = 'XMLHttpRequest';
  csrfHeaders['X-CSRF-Token'] = csrfToken;
}

function get(path, external) {
  const headers = {
    ...defaultHeaders,
  };

  return new Promise((resolve, reject) => {
    fetch(`${external ? '' : '/api/v1'}${path}`, {
      method: 'GET',
      headers,
      credentials: external ? 'same-origin' : 'include',
    }).then((response) => {
      if (response.status === STATUS.OK) return resolve(response);
      return reject(response);
    });
  });
}

function getJson(path, external) {
  const headers = {
    ...defaultHeaders,
  };

  return new Promise((resolve, reject) => {
    fetch(`${external ? '' : '/api/v1'}${path}`, {
      method: 'GET',
      headers,
      credentials: external ? 'same-origin' : 'include',
    }).then((response) => {
      if (response.status === STATUS.OK) {
        response.json().then((res) => resolve(res));
      } else {
        response.json().then((message) => reject(message));
      }
    });
  });
}

function post(path, data) {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
    'Content-Type': 'application/json',
  };

  return fetch(`/api/v1${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

function put(path, data) {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
    'Content-Type': 'application/json',
  };

  return fetch(`/api/v1${path}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

function destroy(path) {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
  };

  return fetch(`/api/v1${path}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });
}

function login(data) {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
    'Content-Type': 'application/json',
  };

  return new Promise((resolve, reject) => {
    fetch('/api/v1/users/login', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status === STATUS.OK) {
        response.json().then((user) => resolve(user));
      } else reject({ message: 'Incorrect Username or Password.' });
    });
  });
}

function logout() {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
  };

  return new Promise((resolve, reject) => {
    fetch('/api/v1/users/logout', {
      method: 'DELETE',
      headers,
      credentials: 'include',
    }).then((response) => {
      if (response.status === STATUS.NO_CONTENT) {
        resolve();
      } else {
        reject(response);
      }
    }, reject);
  });
}

function register(data) {
  const headers = {
    ...defaultHeaders,
    ...csrfHeaders,
    'Content-Type': 'application/json',
  };

  return new Promise((resolve, reject) => {
    fetch('/api/v1/users/register', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status === STATUS.CONTENT_CREATED) {
        resolve(response);
      } else {
        response.json().then((res) => reject(res.error));
      }
    }, reject);
  });
}

function currentUser() {
  return new Promise((resolve, reject) => {
    get('/users/me').then(
      (response) => {
        if (response.status === STATUS.OK) {
          response.json().then(resolve);
        } else {
          reject(response);
        }
      },
      (err) => reject(err)
    );
  });
}

export default {
  ...STATUS,
  login,
  logout,
  register,
  currentUser,
  get,
  getJson,
  post,
  put,
  destroy,
};
