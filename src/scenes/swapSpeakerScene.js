const { Telegraf, Scenes } = require('telegraf');
const botService = require('../bot/bot.service');

const botActionEnum = require('../utils/botActionsEnum');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');

const user = {};
let promptMessage = '';
let swapSpeakerState = false;
let findUserForSwapState = true;

const userSwapFunction = Telegraf.on('message', async ctx => {
	const usersList = await botService.showList();
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

const swapSpeakerScene = new Scenes.WizardScene(
	botActionEnum.swapSpeaker,
	userSwapFunction
);

swapSpeakerScene.enter(async ctx => {
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
	const usersList = await botService.showList();

	ctx.reply(`${usersList}\n<b>Choose the index of the user to update</b>`, {
		reply_markup: botKeyboardEnum.MainMenuKeyboard,
		parse_mode: 'HTML',
	}).then(sentMessage => {
		promptMessage = sentMessage.message_id;
	});
});

module.exports = swapSpeakerScene;
