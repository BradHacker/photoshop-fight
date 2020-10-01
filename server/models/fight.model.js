const mongoose = require('mongoose');
const { UserSchema } = require('./user.model');
const { HashId, fightActionEncode } = require('../util/hashids');

const FightSchema = new mongoose.Schema({
  hashid: { type: String },
  name: { type: String, required: true },
  competitors: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      socketId: { type: String },
      ready: { type: Boolean, default: false },
      stateDone: { type: Boolean, default: false },
    },
  ],
  competitorLimit: { type: Number, required: true, default: 2 },
  roundDuration: { type: Number, required: true, default: 15 * 60 },
  roundCount: { type: Number, required: true, default: 3 },
  roundWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  viewers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      socketId: { type: String },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  state: {
    type: String,
    required: true,
    enum: ['pre-round', 'round-start', 'round-in-progress', 'post-round', 'fight-end'],
    default: 'pre-round',
  },
  stateBeginTime: { type: Date },
  stateLength: { type: Number },
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
  imageSuggestions: [{ type: String }],
  competeUrl: { type: String },
  viewUrl: { type: String },
});

FightSchema.pre('save', function (next) {
  // console.log('validatingggggg');
  if (!this.hashid) this.hashid = HashId.encodeHex(this._id.toString());
  if (!this.competeUrl) this.competeUrl = `/f/${fightActionEncode('compete', this.hashid)}`;
  if (!this.viewUrl) this.viewUrl = `/f/${fightActionEncode('view', this.hashid)}`;
  // if (this.isNew && this.roundWinners.length === 0) this.roundWinners = undefined;
  // console.log(this.roundWinners);
  next();
});

const Fight = mongoose.model('fight', FightSchema);

module.exports = {
  Fight,
  FightSchema,
};
