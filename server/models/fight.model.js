const mongoose = require('mongoose');
const { UserSchema } = require('./user.model');
const HashId = require('../util/hashids');

const FightSchema = new mongoose.Schema({
  hashid: { type: String },
  name: { type: String, required: true },
  competitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  competitorLimit: { type: Number, required: true, default: 2 },
  roundDuration: { type: Number, required: true, default: 15 },
  roundCount: { type: Number, required: true, default: 3 },
  roundWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  state: {
    type: String,
    required: true,
    enum: ['round-start', 'round-in-progress', 'post-round', 'pre-round', 'fight-end'],
    default: 'pre-round',
  },
  currentRound: { type: Number, required: true, default: 1 },
  roundImages: [
    {
      image: {
        type: String,
        required: true,
      },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      roundNum: {
        type: Number,
        required: true,
      },
    },
  ],
});

FightSchema.pre('save', function (next) {
  if (!this.hashid) this.hashid = HashId.encodeHex(this._id.toString());
  // if (this.isNew && this.roundWinners.length === 0) this.roundWinners = undefined;
  // console.log(this.roundWinners);
  next();
});

const Fight = mongoose.model('fight', FightSchema);

module.exports = {
  Fight,
  FightSchema,
};
