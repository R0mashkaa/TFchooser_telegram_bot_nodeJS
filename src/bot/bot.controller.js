const { Telegraf } = require('telegraf');
const cron = require('node-cron');

const botService = require('./bot.service');
const botConstants = require('./bot.constants');

const cronService = require('../cron/cron.service');
const cronConstants = require('../cron/cron.constants');
const chatService = require('../chat/chat.service');

let menuId;
let promptMessage;
const states = {};
require('dotenv').config();

const bot = new Telegraf(process.env.TG_TOKEN);

bot.start(async ctx => {
	const foundedChat = await chatService.findByChatId(ctx.chat.id);
	if (foundedChat.length === 0) {
		await ctx.reply('*🤖 TFChooser bot*', {
			reply_markup: botConstants.welcomeMenuKeyboard,
			parse_mode: 'Markdown',
		});
		await ctx.deleteMessage(ctx.update.message.message_id);

		bot.action(botConstants.createChat, async ctx => {
			const menuId = ctx.update.callback_query.message.message_id;
			await ctx.deleteMessage(menuId);
			ctx.reply('TFChooser bot Successfully added to your chat');
			await chatService.createChat(ctx.chat.id);
		});
	} else {
		await ctx.reply('*🤖 TFChooser main menu*', {
			reply_markup: botConstants.mainMenuKeyboard,
			parse_mode: 'Markdown',
		});
		await ctx.deleteMessage(ctx.update.message.message_id);
	}
});

bot.action(botConstants.presentationList, async ctx => {
	const menuId = ctx.update.callback_query.message.message_id;
	await ctx.deleteMessage(menuId);
	await botService.showList(ctx);
});

bot.action(botConstants.uploadFile, async ctx => {
	ctx.reply('Please send a document (file).').then(sentMessage => {
		promptMessage = sentMessage.message_id;
		menuId = ctx.update.callback_query.message.message_id;

		setState(ctx.from.id, 'uploadFile');

		bot.on('document', async ctx => {
			if (getState(ctx.from.id) === 'uploadFile') {
				await botService.handleFileUpload(ctx);
				await ctx.deleteMessage(menuId);
				await ctx.deleteMessage(promptMessage);
				setState(ctx.from.id, null);
			}
		});
	});
});

bot.action(botConstants.uploadFileLink, ctx => {
	ctx.reply('Please send me a file link').then(sentMessage => {
		menuId = ctx.update.callback_query.message.message_id;
		promptMessage = sentMessage.message_id;

		setState(ctx.from.id, 'uploadFileLink');

		bot.on('message', async ctx => {
			if (getState(ctx.from.id) === 'uploadFileLink') {
				await botService.handleExternalFileLink(ctx);
				await ctx.deleteMessage(menuId);
				await ctx.deleteMessage(promptMessage);
				setState(ctx.from.id, null);
			}
		});
	});
});

bot.action(botConstants.close, async ctx => {
	const messageIdToDelete = ctx.update.callback_query.message.message_id;
	await ctx.deleteMessage(messageIdToDelete);
});

bot.launch();

// Cron Job

cron.schedule(cronConstants.EVERY_DAY_AT_09_00, async () => {
	console.log('CRON RUN sendPoll');
	await cronService.sendMorningPoll(bot);
	console.log('CRON FINISHED sendPoll');
});

cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_00, async () => {
	console.log('CRON RUN processTechnicalFriday');
	await cronService.processTechnicalFriday(bot);
	console.log('CRON FINISHED processTechnicalFriday');
});

cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_25, async () => {
	console.log('CRON RUN sendFridayReminder');
	await cronService.sendTechnicalFridayReminder(bot);
	console.log('CRON FINISHED sendFridayReminder');
});

cron.schedule(cronConstants.EVERY_DAY_AT_18_00, async () => {
	console.log('CRON RUN sendEndOfDayReminder');
	await cronService.sendEndOfDayReminder(bot);
	console.log('CRON FINISHED sendEndOfDayReminder');
});

// State handler

function setState(userId, state) {
	states[userId] = state;
}

function getState(userId) {
	return states[userId];
}
