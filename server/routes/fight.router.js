const express = require('express');
const { Fight } = require('../models/fight.model');

const FightRouter = express.Router();

FightRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).send();
  let user = { ...req.user._doc };
  delete user.password;
  delete user._id;
  return res.status(200).json(user);
});

FightRouter.post('/new', (req, res) => {
  console.log(req.user);
  Fight.create(
    {
      name: req.body.name,
      competitors: [req.user._id],
      competitorLimit: req.body.competitorLimit,
      roundDuration: req.body.roundDuration,
      roundCount: req.body.roundCount,
      createdBy: req.user._id,
    },
    (err, fight) => {
      if (err) return res.status(400).send({ success: false, error: { ...err } });
      return res.status(201).send({ success: true, fight });
    }
  );
});

module.exports = FightRouter;
