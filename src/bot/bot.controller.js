const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const botService = require('./bot.service');
const botConstants = require('./bot.constants');

const cronService = require('../cron/cron.service');
const cronConstants = require('../cron/cron.constants');
const chatService = require('../chat/chat.service');

require('dotenv').config();

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

const userStates = {};

cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_00, async () => {
	console.log('Cron job started');
	await cronService.processTechnicalFriday(bot);
	console.log('Cron job finished');
});

bot.onText(new RegExp(`^${botConstants.COMMAND_START}$`), msg => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, 'Welcome to the main menu!', {
		reply_markup: botConstants.mainMenuKeyboard,
	});
});

bot.on('message', async msg => {
	const chatId = msg.chat.id;
	const fileId = msg.document ? msg.document.file_id : null;
	const selectedText = msg.text;

	await chatService.createChat(chatId);

	switch (selectedText) {
		case botConstants.example1:
			bot.sendMessage(chatId, 'You selected example 1.');
			break;

		case botConstants.example2:
			bot.sendMessage(chatId, 'You selected example 2.');
			break;

		case botConstants.presentationList:
			await botService.showList(bot, chatId);
			break;

		case botConstants.uploadFile:
			userStates[chatId] = botConstants.waitForFile;
			bot.sendMessage(chatId, 'Please upload a file.');
			break;

		case botConstants.uploadFileLink:
			userStates[chatId] = botConstants.waitForLink;
			bot.sendMessage(chatId, 'Please send the external link to the Excel file.');
			break;

		default:
			handleUserInput(selectedText, chatId, fileId, msg);
			break;
	}
});

// Handle functions

async function handleUserInput(selectedText, chatId, fileId, msg) {
	if (userStates[chatId] === botConstants.waitForFile && fileId) {
		await botService.handleFileUpload(bot, msg, fileId);
		userStates[chatId] = undefined;
	} else if (userStates[chatId] === botConstants.waitForLink) {
		await botService.handleExternalFileLink(bot, msg.text, chatId);
		userStates[chatId] = undefined;
	} else if (selectedText !== botConstants.COMMAND_START) {
		bot.sendMessage(chatId, 'Invalid selection. Please choose a valid option.', {
			reply_markup: botConstants.mainMenuKeyboard,
		});
	}
}
