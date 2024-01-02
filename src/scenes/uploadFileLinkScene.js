const { Scenes } = require('telegraf');
const botService = require('../bot/bot.service');
const botActionEnum = require('../utils/botActionsEnum');

const uploadFileLinkScene = new Scenes.BaseScene(botActionEnum.uploadFileLink);

uploadFileLinkScene.enter(async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	await ctx.reply('Please send me a excel file link');
});

uploadFileLinkScene.on('message', async ctx => {
	await botService.handleExternalFileLink(ctx);
	Promise.all([
		ctx.deleteMessage(ctx.message.message_id),
		ctx.deleteMessage(ctx.message.message_id - 1),
	]);
	await ctx.scene.leave();
});

module.exports = uploadFileLinkScene;
