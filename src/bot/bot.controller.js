const { Telegraf } = require('telegraf');
const cron = require('node-cron');

const botService = require('./bot.service');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');
const botActionEnum = require('../utils/botActionsEnum');

const cronService = require('../cron/cron.service');
const cronConstants = require('../cron/cron.constants');
const chatService = require('../chat/chat.service');

let menuId;
let promptMessage;
let uploadFileState = false;
let uploadFileLinkState = false;

require('dotenv').config();

const bot = new Telegraf(process.env.TG_TOKEN);

bot.start(async ctx => {
	const foundedChat = await chatService.findByChatId(ctx.chat.id);
	if (foundedChat.length === 0) {
		await ctx.reply('*🤖 TFChooser bot*', {
			reply_markup: botKeyboardEnum.WelcomeMenuKeyboard,
			parse_mode: 'Markdown',
		});
		await ctx.deleteMessage(ctx.update.message.message_id);

		bot.action(botKeyboardEnum.createChat, async ctx => {
			const menuId = ctx.update.callback_query.message.message_id;
			await ctx.deleteMessage(menuId);
			ctx.reply('TFChooser bot Successfully added to your chat');
			await chatService.createChat(ctx.chat.id);
		});
	} else {
		await ctx.reply('*🤖 TFChooser main menu*', {
			reply_markup: botKeyboardEnum.MainMenuKeyboard,
			parse_mode: 'Markdown',
		});
		await ctx.deleteMessage(ctx.update.message.message_id);
	}
});

bot.action(botActionEnum.presentationList, async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	const list = await botService.showList();
	ctx.reply(list, {
		parse_mode: 'HTML',
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
	});
});

bot.action(botActionEnum.uploadFile, async ctx => {
	ctx.reply('Please send a document (file).').then(sentMessage => {
		promptMessage = sentMessage.message_id;
		menuId = ctx.update.callback_query.message.message_id;
		uploadFileState = true;

		bot.on('document', async ctx => {
			if (uploadFileState) {
				await botService.handleFileUpload(ctx);
				Promise.all([
					await ctx.deleteMessage(menuId),
					await ctx.deleteMessage(promptMessage),
				]);
				uploadFileState = false;
			}
		});
	});
});

bot.action(botActionEnum.uploadFileLink, ctx => {
	ctx.reply('Please send me a file link').then(sentMessage => {
		menuId = ctx.update.callback_query.message.message_id;
		promptMessage = sentMessage.message_id;
		uploadFileLinkState = true;

		bot.on('message', async ctx => {
			if (uploadFileLinkState) {
				await botService.handleExternalFileLink(ctx);
				Promise.all([
					await ctx.deleteMessage(menuId),
					await ctx.deleteMessage(promptMessage),
				]);
				uploadFileLinkState = false;
			}
		});
	});
});

bot.action(botActionEnum.updateUser, async ctx => {
	const usersList = await botService.showList();
	menuId = ctx.update.callback_query.message.message_id;
	await ctx.deleteMessage(menuId);
	ctx.reply(`${usersList}\n<b>Choose the index of the user to update</b>`, {
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
		parse_mode: 'HTML',
	}).then(sentMessage => {
		let user = {};
		let updateUserState = false;
		let findUserForUpdateState = true;
		promptMessage = sentMessage.message_id;

		bot.on('message', async ctx => {
			if (findUserForUpdateState) {
				user = await botService.findUserByIndex(
					ctx,
					usersList,
					botActionEnum.updateUser
				);

				updateUserState = true;
				findUserForUpdateState = false;
			} else if (updateUserState) {
				await botService.updateUser(ctx, user);
				Promise.all([
					ctx.deleteMessage(ctx.message.message_id),
					ctx.deleteMessage(ctx.message.message_id - 1),
					ctx.deleteMessage(ctx.message.message_id - 2),
					ctx.deleteMessage(promptMessage),
				]);

				findUserForUpdateState = false;
				updateUserState = false;
			}
		});
	});
});

bot.action(botActionEnum.swapSpeaker, async ctx => {
	const usersList = await botService.showList();
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	ctx.reply(`${usersList}\n<b>Choose the first index of the user to change</b>`, {
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
		parse_mode: 'HTML',
	}).then(sentMessage => {
		let userToChange = {};
		let selectedUser = {};
		let swapSpeakerState = false;
		let findUserForSwapState = true;
		promptMessage = sentMessage.message_id;

		bot.on('message', async ctx => {
			if (findUserForSwapState) {
				userToChange = await botService.findUserByIndex(
					ctx,
					usersList,
					botActionEnum.swapSpeaker
				);

				findUserForSwapState = false;
				swapSpeakerState = true;
			} else if (swapSpeakerState) {
				selectedUser = await botService.findUserByIndex(
					ctx,
					usersList,
					botActionEnum.swapSpeaker
				);
				await botService.changeSpeaker(ctx, selectedUser, userToChange);
				Promise.all([
					ctx.deleteMessage(ctx.message.message_id),
					ctx.deleteMessage(ctx.message.message_id + 1),
					ctx.deleteMessage(ctx.message.message_id - 1),
					ctx.deleteMessage(ctx.message.message_id - 2),
					ctx.deleteMessage(promptMessage),
				]);

				findUserForUpdateState = false;
				swapSpeakerState = false;
			}
		});
	});
});

bot.action(botActionEnum.close, async ctx => {
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
