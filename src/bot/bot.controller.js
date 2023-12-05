const { Telegraf } = require('telegraf');
const cron = require('node-cron');

const botService = require('./bot.service');
const botConstants = require('./bot.constants');

const cronService = require('../cron/cron.service');
const cronConstants = require('../cron/cron.constants');
const chatService = require('../chat/chat.service');

require('dotenv').config();

const bot = new Telegraf(process.env.TG_TOKEN);

const userStates = {};

bot.start((ctx) => {
    ctx.reply('Welcome to the main menu!', {
        reply_markup: botConstants.mainMenuKeyboard,
    });
});

bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;
    const fileId = ctx.message.document ? ctx.message.document.file_id : null;
    const selectedText = ctx.message.text;

    await chatService.createChat(chatId);

    switch (selectedText) {
        case botConstants.example1:
            ctx.reply('You selected example 1.');
            break;

        case botConstants.example2:
            ctx.reply('You selected example 2.');
            break;

        case botConstants.presentationList:
            await botService.showList(ctx);
            break;

        case botConstants.uploadFile:
            userStates[chatId] = botConstants.waitForFile;
            ctx.reply('Please upload a file.');
            break;

        case botConstants.uploadFileLink:
            userStates[chatId] = botConstants.waitForLink;
            ctx.reply('Please send the external link to the Excel file.');
            break;

        default:
            handleUserInput(selectedText, chatId, fileId, ctx);
            break;
    }
});

bot.launch();

// Handle functions
async function handleUserInput(selectedText, chatId, fileId, ctx) {
    if (userStates[chatId] === botConstants.waitForFile && fileId) {
        await botService.handleFileUpload(ctx, fileId);
        userStates[chatId] = undefined;
    } else if (userStates[chatId] === botConstants.waitForLink) {
        await botService.handleExternalFileLink(ctx);
        userStates[chatId] = undefined;
    } else if (selectedText !== botConstants.COMMAND_START) {
        ctx.reply('Invalid selection. Please choose a valid option.', {
            reply_markup: botConstants.mainMenuKeyboard,
        });
    }
}

// Enable graceful stop
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    schedule.gracefulShutdown()
        .then(() => process.exit(0));
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    schedule.gracefulShutdown()
        .then(() => process.exit(0));
});

cron.schedule(cronConstants.EVERY_FRIDAY_AT_17_00, async () => {
    console.log('Cron job started');
    await cronService.processTechnicalFriday(bot);
    console.log('Cron job finished');
});
