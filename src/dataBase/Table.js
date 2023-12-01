const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
	theme: { type: String, trim: true, default: "Don't have presentation theme" },
	owner: { type: String, trim: true },
	telegramId: { type: String, trim: true },
	presentationDate: { type: Date },
});

module.exports = mongoose.model('Table', TableSchema);
