const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const XLSX = require('xlsx');
const axios = require('axios');

const utilsService = require('../utils/utils');
const tableService = require('../table/table.service');
const botKeyboardEnum = require('../utils/botKeyboardsEnum');
const botActionEnum = require('../utils/botActionsEnum');

require('dotenv').config();
dayjs.extend(customParseFormat);

module.exports = {
	handleFileUpload: async ctx => {
		try {
			const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
			const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
			const workbook = XLSX.read(response.data, { type: 'buffer' });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const data = await XLSX.utils.sheet_to_json(sheet);

			const usersArray = await utilsService.assignRandomFriday(data);
			await tableService.deleteManyAndCreate(usersArray),
				ctx.reply('Excel file data has been successfully added to MongoDB.', {
					reply_markup: botKeyboardEnum.MainMenuKeyboard,
				});
		} catch (error) {
			console.error('Error handling file upload:', error);
			ctx.reply('Failed excel file data adding to MongoDB.', {
				reply_markup: botKeyboardEnum.MainMenuKeyboard,
			});
		}
	},

	handleExternalFileLink: async ctx => {
		try {
			const response = await axios.get(ctx.message.text, {
				responseType: 'arraybuffer',
			});
			const sheet = XLSX.read(response.data, { type: 'buffer' }).Sheets[
				XLSX.read(response.data).SheetNames[0]
			];
			const header = XLSX.utils
				.sheet_to_json(sheet, { header: 1 })[0]
				.filter(Boolean);
			const data = XLSX.utils.sheet_to_json(sheet, { header });

			const usersArray = await utilsService.assignRandomFriday(
				data
					.filter(row => row.C)
					.map(row => ({ theme: row.B, owner: row.C, telegramId: row.D }))
					.slice(1)
			);
			await tableService.deleteManyAndCreate(usersArray),
				ctx.reply(
					'Excel file data from the external link has been successfully added to MongoDB.',
					{
						reply_markup: botKeyboardEnum.MainMenuKeyboard,
					}
				);
		} catch (error) {
			console.error('Error handling external file link:', error);
			ctx.reply('Error handling the external file link.', {
				reply_markup: botKeyboardEnum.MainMenuKeyboard,
			});
		}
	},

	showList: async () => {
		try {
			const usersArray = await tableService.findAll();

			if (usersArray.length === 0) {
				return '<b>Error DB is empty. Use menu to upload data.</b>';
			}

			const currentDate = dayjs();
			usersArray.sort((a, b) => {
				const dateA = dayjs(a.presentationDate);
				const dateB = dayjs(b.presentationDate);
				return dateA.diff(dateB);
			});

			const formattedArray = usersArray.map((user, index) => {
				const presentationDate = dayjs(user.presentationDate);
				const formattedDate = presentationDate.format('DD.MM.YYYY 17:30');
				let userText = `${index + 1}. Name: ${user.owner}\nTheme: ${
					user.theme
				}\nDate: ${formattedDate}`;

				if (presentationDate.isBefore(currentDate, 'day')) {
					userText = `<s>${userText}</s>`;
				}

				return `${userText}\n======================================`;
			});

			messageText = formattedArray.join('\n');
			return messageText;
		} catch (error) {
			console.error('Error parsing users array:', error);
		}
	},

	findUserByIndex: async (ctx, userListString, state) => {
		try {
			const usersArray = await utilsService.usersListParses(userListString);
			const userInput = parseInt(ctx.message.text);

			if (
				Number.isInteger(userInput) &&
				userInput > 0 &&
				userInput <= usersArray.length
			) {
				const user = usersArray[userInput - 1];

				switch (state) {
					case botActionEnum.updateUser:
						ctx.reply(
							`Found user at index ${userInput}.\nName: ${user.owner}\nTheme: ${user.theme}\nDate: ${user.presentationDate}\nEnter new theme: `
						);
						return user;

					case botActionEnum.swapSpeaker:
						ctx.reply(
							`Found user at index ${userInput}.\nName: ${user.owner}\nTheme: ${user.theme}\nDate: ${user.presentationDate}`
						);
						return user;

					default:
						console.log('Wrong state entered');
				}
			} else {
				ctx.reply('Invalid input. Please enter a valid index from the list.');
			}
		} catch (error) {
			console.error('Error parsing users array:', error);
			ctx.reply(
				'An error occurred while parsing user data. Please try again later.'
			);
		}
	},

	updateUser: async (ctx, user) => {
		try {
			await tableService.updateFieldByName('theme', user.owner, ctx.message.text);
			ctx.reply(`${user.owner} theme updated to ${ctx.message.text}.`, {
				reply_markup: botKeyboardEnum.MainMenuKeyboard,
			});
		} catch (error) {
			console.error('Error updating user: ', error);
			ctx.reply(
				'An error occurred while updating user data. Please try again later.'
			);
		}
	},

	changeSpeaker: async (ctx, userSelected, usertoChange) => {
		try {
			const originalDateUserSelected = dayjs(
				userSelected.presentationDate,
				'DD.MM.YYYY HH:mm'
			).toDate();
			const originalDateUserToChange = dayjs(
				usertoChange.presentationDate,
				'DD.MM.YYYY HH:mm'
			).toDate();

			await tableService.updateFieldByName(
				'presentationDate',
				userSelected.owner,
				originalDateUserToChange
			);
			await tableService.updateFieldByName(
				'presentationDate',
				usertoChange.owner,
				originalDateUserSelected
			);
			ctx.reply(
				`${usertoChange.owner} swaped with ${userSelected.owner} presentation dates.`,
				{
					reply_markup: botKeyboardEnum.MainMenuKeyboard,
				}
			);
		} catch (error) {
			console.error('Error updating user: ', error);
			ctx.reply(
				'An error occurred while updating user data. Please try again later.'
			);
		}
	},
};
