const express = require('express');
const { Fight } = require('../models/fight.model');
const { HashId } = require('../util/hashids');

const FightRouter = express.Router();

FightRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).send();
  let user = { ...req.user._doc };
  delete user.password;
  delete user._id;
  return res.status(200).json(user);
});

FightRouter.post('/new', (req, res) => {
  // console.log(req.user);
  Fight.create(
    {
      name: req.body.name,
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

FightRouter.post('/:id/image', (req, res, next) => {
  Fight.findByIdAndUpdate(
    HashId.decodeHex(req.params.id),
    {
      $push: { imageSuggestions: req.body.image },
    },
    (err, fight) => {
      if (err) return res.status(400).send({ success: false, error: { ...err } });
      return res.status(201).send({ success: true });
    }
  );
});

module.exports = FightRouter;
