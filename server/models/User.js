const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  rank: { type: String, default: 'Newbie' },
  numberOfSales: { type: Number, default: 0 },
  numberOfBuys: { type: Number, default: 0 },
  XP: { type: Number, default: 0 },
  coinnectCoins: { type: Number, default: 0},
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);