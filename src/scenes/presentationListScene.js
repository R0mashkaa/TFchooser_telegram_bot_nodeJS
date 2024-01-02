const { Scenes } = require('telegraf');
const botService = require('../bot/bot.service');

const botActionEnum = require('../utils/botActionsEnum');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');

const presentationListScene = new Scenes.BaseScene(botActionEnum.presentationList);

presentationListScene.enter(async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	const list = await botService.showList();
	ctx.reply(list, {
		parse_mode: 'HTML',
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
	});
});

module.exports = presentationListScene;
