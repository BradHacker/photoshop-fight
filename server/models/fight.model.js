const mongoose = require('mongoose');
const { UserSchema } = require('./user.model');

const FightSchema = new mongoose.Schema({
  name: { type: String, required: true },
  competitors: [UserSchema],
  competitorLimit: { type: Number, required: true, default: 2 },
  roundDuration: { type: Number, required: true, default: 15 },
  roundCount: { type: Number, required: true, default: 3 },
  roundWinners: [UserSchema],
  viewers: [UserSchema],
  createdBy: UserSchema,
  state: {
    type: String,
    required: true,
    enum: ['round-start', 'round-in-progress', 'post-round', 'pre-round', 'fight-end'],
    default: 'pre-round',
  },
});
