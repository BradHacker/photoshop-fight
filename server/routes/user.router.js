const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const { User } = require('../models/user.model');

const UserRouter = express.Router();

UserRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).send();
  let user = { ...req.user._doc };
  delete user.password;
  delete user._id;
  return res.status(200).json(user);
});

UserRouter.post('/register', (req, res) => {
  User.create(
    {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: bcrypt.hashSync(req.body.password),
    },
    (err, user) => {
      if (err) return res.status(400).send({ success: false, error: { ...err } });
      return res.status(201).send({ success: true, user });
    }
  );
});

UserRouter.post('/login', passport.authenticate('local'), (req, res) => {
  if (req.user) return res.json(req.user);
  return res.status(404).send({ message: 'Username or Password is incorrect' });
});

UserRouter.delete('/logout', (req, res) => {
  req.logout();
  return res.status(204).send();
});

module.exports = UserRouter;
