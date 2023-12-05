const ChatModel = require('../dataBase/Chat');

module.exports = {
	createChat: async chatId => {
		chatExist = await ChatModel.findOne({ chatId });
		if (!chatExist) {
			await ChatModel.create({ chatId });
		}
	},

	findAll: async () => {
		return ChatModel.find({});
	},

	findByChatId: async id => {
		return ChatModel.find({ chatId: id });
	},
};
