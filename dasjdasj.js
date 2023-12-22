// const { Telegraf } = require('telegraf');
// const cron = require('node-cron');

// const botService = require('./bot.service');
// const botConstants = require('./bot.constants');

// const cronService = require('../cron/cron.service');
// const cronConstants = require('../cron/cron.constants');
// const chatService = require('../chat/chat.service');

// let menuId;
// let promptMessage;
// const states = {};
// require('dotenv').config();

// const bot = new Telegraf(process.env.TG_TOKEN);

// bot.start(async ctx => {
// 	const foundedChat = await chatService.findByChatId(ctx.chat.id);
// 	if (foundedChat.length === 0) {
// 		await ctx.reply('*🤖 TFChooser bot*', {
// 			reply_markup: botConstants.welcomeMenuKeyboard,
// 			parse_mode: 'Markdown',
// 		});
// 		await ctx.deleteMessage(ctx.update.message.message_id);

// 		bot.action(botConstants.createChat, async ctx => {
// 			const menuId = ctx.update.callback_query.message.message_id;
// 			await ctx.deleteMessage(menuId);
// 			ctx.reply('TFChooser bot Successfully added to your chat');
// 			await chatService.createChat(ctx.chat.id);
// 		});
// 	} else {
// 		await ctx.reply('*🤖 TFChooser main menu*', {
// 			reply_markup: botConstants.mainMenuKeyboard,
// 			parse_mode: 'Markdown',
// 		});
// 		await ctx.deleteMessage(ctx.update.message.message_id);
// 	}
// });

// bot.action(botConstants.presentationList, async ctx => {
// 	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
// 	const list = await botService.showList();
// 	ctx.reply(list, {
// 		parse_mode: 'HTML',
// 		reply_markup: botConstants.mainMenuKeyboard,
// 	});
// });

// bot.action(botConstants.uploadFile, async ctx => {
// 	ctx.reply('Please send a document (file).').then(sentMessage => {
// 		promptMessage = sentMessage.message_id;
// 		menuId = ctx.update.callback_query.message.message_id;

// 		setState(ctx.from.id, 'uploadFile');

// 		bot.on('document', async ctx => {
// 			if (getState(ctx.from.id) === 'uploadFile') {
// 				await botService.handleFileUpload(ctx);
// 				await ctx.deleteMessage(menuId);
// 				await ctx.deleteMessage(promptMessage);
// 				dropState(ctx.from.id);
// 			}
// 		});
// 	});
// });

// bot.action(botConstants.uploadFileLink, ctx => {
// 	ctx.reply('Please send me a file link').then(sentMessage => {
// 		menuId = ctx.update.callback_query.message.message_id;
// 		promptMessage = sentMessage.message_id;

// 		setState(ctx.from.id, 'uploadFileLink');

// 		bot.on('message', async ctx => {
// 			if (getState(ctx.from.id) === 'uploadFileLink') {
// 				await botService.handleExternalFileLink(ctx);
// 				await ctx.deleteMessage(menuId);
// 				await ctx.deleteMessage(promptMessage);
// 				dropState(ctx.from.id);
// 			}
// 		});
// 	});
// });

// bot.action(botConstants.updateUser, async ctx => {
// 	const usersList = await botService.showList();
// 	let user = {};
// 	menuId = ctx.update.callback_query.message.message_id;
// 	await ctx.deleteMessage(menuId);
// 	ctx.reply(`${usersList}\n<b>Choose the index of the user to update</b>`, {
// 		reply_markup: botConstants.mainMenuKeyboard,
// 		parse_mode: 'HTML',
// 	}).then(sentMessage => {
// 		promptMessage = sentMessage.message_id;
// 		dropState(ctx.from.id);
// 		setState(ctx.from.id, 'waitForIndexTheme');
// 		console.log(1111, states);
// 		bot.on('message', async ctx => {
// 			if (getState(ctx.from.id) === 'waitForIndexTheme') {
// 				user = await botService.findUserByIndex(
// 					ctx,
// 					usersList,
// 					botConstants.updateUser
// 				);

// 				await ctx.deleteMessage(promptMessage);
// 				await ctx.deleteMessage(ctx.message.message_id);
// 				setState(ctx.from.id, 'waitForUpdate');
// 			} else if (getState(ctx.from.id) === 'waitForUpdate') {
// 				await botService.updateUser(ctx, user);

// 				await ctx.deleteMessage(ctx.message.message_id);
// 				await ctx.deleteMessage(ctx.message.message_id - 1);
// 				dropState(ctx.from.id);
// 			}
// 		});
// 	});
// });

// bot.action(botConstants.swapSpeaker, async ctx => {
// 	const usersList = await botService.showList();
// 	let userToChange = {};
// 	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
// 	ctx.reply(`${usersList}\n<b>Choose the first index of the user to change</b>`, {
// 		reply_markup: botConstants.mainMenuKeyboard,
// 		parse_mode: 'HTML',
// 	}).then(sentMessage => {
// 		promptMessage = sentMessage.message_id;
// 		dropState(ctx.from.id);
// 		setState(ctx.from.id, 'waitForIndexSwap');
// 		console.log(1111, states);
// 		bot.on('message', async ctx => {
// 			if (getState(ctx.from.id) === 'waitForIndexSwap') {
// 				userToChange = await botService.findUserByIndex(
// 					ctx,
// 					usersList,
// 					botConstants.swapSpeaker
// 				);
// 				setState(ctx.from.id, 'waitForSwap');
// 			} else if (getState(ctx.from.id) === 'waitForSwap') {
// 				const selectedUser = await botService.findUserByIndex(
// 					ctx,
// 					usersList,
// 					botConstants.swapSpeaker
// 				);
// 				await botService.changeSpeaker(ctx, selectedUser, userToChange);
// 				await handleExistingChat(ctx);
// 				await ctx.deleteMessage(promptMessage);
// 				dropState(ctx.from.id);
// 			}
// 		});
// 	});
// });

// bot.action(botConstants.close, async ctx => {
// 	const messageIdToDelete = ctx.update.callback_query.message.message_id;
// 	await ctx.deleteMessage(messageIdToDelete);
// });

// bot.launch();

// // Cron Job

// cron.schedule(cronConstants.EVERY_DAY_AT_09_00, async () => {
// 	console.log('CRON RUN sendPoll');
// 	await cronService.sendMorningPoll(bot);
// 	console.log('CRON FINISHED sendPoll');
// });

// cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_00, async () => {
// 	console.log('CRON RUN processTechnicalFriday');
// 	await cronService.processTechnicalFriday(bot);
// 	console.log('CRON FINISHED processTechnicalFriday');
// });

// cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_25, async () => {
// 	console.log('CRON RUN sendFridayReminder');
// 	await cronService.sendTechnicalFridayReminder(bot);
// 	console.log('CRON FINISHED sendFridayReminder');
// });

// cron.schedule(cronConstants.EVERY_DAY_AT_18_00, async () => {
// 	console.log('CRON RUN sendEndOfDayReminder');
// 	await cronService.sendEndOfDayReminder(bot);
// 	console.log('CRON FINISHED sendEndOfDayReminder');
// });

// // State handler

// function setState(userId, state) {
// 	states[userId] = state;
// }

// function getState(userId) {
// 	return states[userId];
// }

// function dropState(userId) {
// 	delete states[userId];
// }
// // 