const express = require('express');
const { User } = require('../models/user.model');

const UserRouter = express.Router();

UserRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).send();
  return res.status(200).json(req.user);
});

module.exports = UserRouter;
