const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const hashids = require('hashids');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hashid: { type: String, required: true },
});

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function (next) {
  if (!this.hashid) this.hashid = new hashids(process.env.HASHID_SALT).encodeHex(this._id.toString());
  next();
});

const User = mongoose.model('user', UserSchema);

module.exports = {
  User,
  UserSchema,
};
