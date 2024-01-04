const { Telegraf, Scenes, session } = require('telegraf');
const cron = require('node-cron');

const botActionEnum = require('../utils/botActionsEnum');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');

const cronService = require('../cron/cron.service');
const cronConstants = require('../cron/cron.constants');
const chatService = require('../chat/chat.service');
const uploadFileScene = require('../scenes/uploadFileScene');
const uploadFileLinkScene = require('../scenes/uploadFileLinkScene');
const presentationListScene = require('../scenes//presentationListScene');
const updateUserThemeScene = require('../scenes/updateUserThemeScene');
const swapSpeakerScene = require('../scenes/swapSpeakerScene');

require('dotenv').config();

const bot = new Telegraf(process.env.TG_TOKEN);
const stage = new Scenes.Stage([
	uploadFileScene,
	uploadFileLinkScene,
	presentationListScene,
	updateUserThemeScene,
	swapSpeakerScene,
]);

bot.use(session({ databaseName: 'tf_chooser', collectionName: '/sessions' }));
bot.use(stage.middleware());

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
	await ctx.scene.enter('presentationList');
});
bot.action(botActionEnum.uploadFile, async ctx => {
	await ctx.scene.enter('uploadFile');
});
bot.action(botActionEnum.uploadFileLink, async ctx => {
	await ctx.scene.enter('uploadFileLink');
});
bot.action(botActionEnum.updateUser, async ctx => {
	await ctx.scene.enter('updateUser');
});
bot.action(botActionEnum.swapSpeaker, async ctx => {
	await ctx.scene.enter('swapSpeaker');
});
bot.action(botActionEnum.close, async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
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

cron.schedule(cronConstants.EVERY_FIVE_MIN, async () => {
	console.log('CRON RUN test');
	console.log('CRON FINISHED test');
});

