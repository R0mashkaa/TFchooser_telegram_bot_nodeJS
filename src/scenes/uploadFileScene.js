const { Scenes } = require('telegraf');
const botService = require('../bot/bot.service');
const botActionEnum = require('../utils/botActionsEnum');

const uploadFileScene = new Scenes.BaseScene(botActionEnum.uploadFile);

uploadFileScene.enter(async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	await ctx.reply('Please send a excel document (file).');
});

uploadFileScene.on('document', async ctx => {
	await botService.handleFileUpload(ctx);
	Promise.all([
		ctx.deleteMessage(ctx.message.message_id),
		ctx.deleteMessage(ctx.message.message_id - 1),
	]);
	await ctx.scene.leave();
});

module.exports = uploadFileScene;
