const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
	chatId: { type: String, unique: true, required: true },
});

module.exports = mongoose.model('Chat', ChatSchema);
