const dayjs = require('dayjs');
require('telegraf');

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

				await bot.telegram.sendMessage(
					chatId,
					`Speaker of today's Technical Friday at 17:30 is ${speakerArray[0].owner} with '${speakerArray[0].theme}' theme.`
				);
				await bot.telegram.sendMessage(
					chatId,
					`Next Technical Friday speaker is ${speakerArray[1].owner} with '${
						speakerArray[1].theme
					}' theme. On ${dayjs(speakerArray[1].presentationDate).format(
						'DD.MM.YYYY 17:30'
					)}`
				);
			}
		} catch (error) {
			console.error('Error processing Technical Friday:', error);
		}
	},

	sendEndOfDayReminder: async bot => {
		try {
			const allChats = await chatService.findAll();
			for (const chat of allChats) {
				const chatId = chat.chatId;
				await bot.telegram.sendMessage(
					chatId,
					'Hello, its 18:00 PM, please fill your status for today in Excel file'
				);
			}
		} catch (error) {
			console.error('Failed to send end of day reminder:', error);
		}
	},

	sendTechnicalFridayReminder: async bot => {
		try {
			const allChats = await chatService.findAll();
			for (const chat of allChats) {
				const chatId = chat.chatId;
				await bot.telegram.sendMessage(
					chatId,
					'Technical Friday will start in 5 min. Please join the meeting room.'
				);
			}
		} catch (error) {
			console.error('Failed to send Friday reminder:', error);
		}
	},

	sendMorningPoll: async bot => {
		const pollOptions = ['WFO', 'WFH', 'Day Off', 'Sick day', 'Other'];
		try {
			const allChats = await chatService.findAll();
			for (const chat of allChats) {
				const chatId = chat.chatId;
				await bot.telegram.sendPoll(
					chatId,
					'What is your status today?',
					pollOptions,
					{ is_anonymous: false }
				);
			}
		} catch (error) {
			console.error('Failed to send poll:', error);
		}
	},
};
