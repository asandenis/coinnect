const mongoose = require('mongoose');

const cryptocurrencySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
});

const Cryptocurrency = mongoose.model('Cryptocurrency', cryptocurrencySchema);

module.exports = Cryptocurrency;