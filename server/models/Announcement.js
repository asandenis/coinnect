const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);