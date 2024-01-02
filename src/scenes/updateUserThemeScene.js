const { Telegraf, Scenes } = require('telegraf');
const botService = require('../bot/bot.service');

const botActionEnum = require('../utils/botActionsEnum');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');

let user = {};
let promptMessage = '';
let updateUserState = false;
let findUserForUpdateState = true;

const userUpdateThemeFunction = Telegraf.on('message', async ctx => {
	const usersList = await botService.showList();
	if (findUserForUpdateState) {
		user = await botService.findUserByIndex(ctx, usersList, botActionEnum.updateUser);

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

const updateUserThemeScene = new Scenes.WizardScene(
	botActionEnum.updateUser,
	userUpdateThemeFunction
);

updateUserThemeScene.enter(async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	const usersList = await botService.showList();

	ctx.reply(`${usersList}\n<b>Choose the index of the user to update</b>`, {
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
		parse_mode: 'HTML',
	}).then(sentMessage => {
		promptMessage = sentMessage.message_id;
	});
});

module.exports = updateUserThemeScene;
