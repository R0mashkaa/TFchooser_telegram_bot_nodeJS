const dayjs = require('dayjs');
const XLSX = require('xlsx');
const axios = require('axios');

const botConstants = require('./bot.constants');
const tableService = require('../table/table.service');

require('dotenv').config();

module.exports = {
	handleFileUpload: async ctx => {
		try {
			const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
			const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
			const workbook = XLSX.read(response.data, { type: 'buffer' });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const data = await XLSX.utils.sheet_to_json(sheet);

			await tableService.createMany(await module.exports.assignRandomFriday(data));

			ctx.reply('Excel file data has been successfully added to MongoDB.', {
				reply_markup: botConstants.mainMenuKeyboard,
			});
		} catch (error) {
			console.error('Error handling file upload:', error);
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

			const usersArray = await module.exports.assignRandomFriday(
				data
					.filter(row => row.C)
					.map(row => ({ theme: row.B, owner: row.C, telegramId: row.D }))
					.slice(1)
			);

			await tableService.createMany(usersArray);

			ctx.reply(
				'Excel file data from the external link has been successfully added to MongoDB.',
				{
					reply_markup: botConstants.mainMenuKeyboard,
				}
			);
		} catch (error) {
			console.error('Error handling external file link:', error);
			ctx.reply('Error handling the external file link.');
		}
	},

	showList: async ctx => {
		const usersArray = await tableService.findAll();

		if (usersArray.length === 0) {
			ctx.reply('<b>Error DB is empty.</b>', {
				parse_mode: 'HTML',
			});
		}

		const currentDate = dayjs();

		usersArray.sort((a, b) => {
			const dateA = dayjs(a.presentationDate);
			const dateB = dayjs(b.presentationDate);
			return dateA.diff(dateB);
		});

		const formattedArray = usersArray.map(user => {
			const presentationDate = dayjs(user.presentationDate);
			const formattedDate = presentationDate.format('DD.MM.YYYY HH:mm');
			let userText = `<b>Name:</b> <i>${user.owner}</i>\n<b>Topic:</b> <i>${user.theme}</i>\n<b>Date:</b> <i>${formattedDate}</i>`;

			if (presentationDate.isBefore(currentDate, 'day')) {
				userText = `<s>${userText}</s>`;
			}

			return `${userText}\n======================================`;
		});

		messageText = formattedArray.join('\n');

		ctx.reply(messageText, {
			parse_mode: 'HTML',
		});
		ctx.reply('*TFChooser main menu*', {
			reply_markup: botConstants.mainMenuKeyboard,
			parse_mode: 'Markdown',
		});
	},

	assignRandomFriday: async usersArray => {
		const fridayDates = [];

		let currentDate = dayjs().startOf('day').day(5);

		while (fridayDates.length < usersArray.length) {
			fridayDates.push(currentDate.clone().hour(17).minute(30));
			currentDate = currentDate.add(7, 'days');
		}

		for (let i = fridayDates.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[fridayDates[i], fridayDates[j]] = [fridayDates[j], fridayDates[i]];
		}

		usersArray.forEach((user, index) => {
			user.presentationDate = fridayDates[index].toDate();
		});

		return usersArray;
	},
};
