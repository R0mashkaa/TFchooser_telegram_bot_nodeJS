const dayjs = require('dayjs');

const chatService = require('../chat/chat.service');
const tableService = require('../table/table.service');

module.exports = {
	processTechnicalFriday: async bot => {
		try {
			const allChats = await chatService.findAll();
			for (const chat of allChats) {
				const chatId = chat.chatId;

				currentTime = new Date();
				const eightDaysLater = new Date(currentTime);
				eightDaysLater.setDate(currentTime.getDate() + 8);

				const speakerArray = await tableService.findQuery({
					presentationDate: {
						$gte: currentTime,
						$lte: eightDaysLater,
					},
				});

				await bot.sendMessage(
					chatId,
					`Speaker of today's Technical Friday at 17:30 is ${speakerArray[1].owner} with '${speakerArray[1].theme}' theme.`
				);
				await bot.sendMessage(
					chatId,
					`Next Technical Friday speaker is ${speakerArray[0].owner} with '${
						speakerArray[0].theme
					}' theme. On ${dayjs(speakerArray[0].presentationDate).format(
						'DD.MM.YYYY 17:30'
					)}`
				);
			}
		} catch (error) {
			console.error('Error processing Technical Friday:', error);
		}
	},
};
