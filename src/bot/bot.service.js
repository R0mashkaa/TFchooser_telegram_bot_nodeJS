const dayjs = require('dayjs');
const XLSX = require('xlsx');
const axios = require('axios');

const botConstants = require('./bot.constants');
const tableService = require('../table/table.service');

require('dotenv').config();

module.exports = {
    handleFileUpload: async (ctx, fileId) => {
        try {
            const fileLink = await ctx.telegram.getFileLink(fileId);
            const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
            const workbook = XLSX.read(response.data, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = await XLSX.utils.sheet_to_json(sheet);

            const usersArray = await module.exports.assignRandomFriday(data);
            await tableService.createMany(usersArray);

            ctx.reply(
                'Excel file data has been successfully added to MongoDB.',
                { reply_markup: botConstants.mainMenuKeyboard }
            );
        } catch (error) {
            console.error('Error handling file upload:', error);
        }
    },

	handleExternalFileLink: async (ctx) => {
		try {
		  const response = await axios.get(ctx.message.text, { responseType: 'arraybuffer' });
	  
		  const workbook = XLSX.read(response.data, { type: 'buffer' });
		  const sheet = workbook.Sheets[workbook.SheetNames[0]];
	  
		  const header = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
		  const filteredHeader = header.filter(Boolean);
		  const data = XLSX.utils.sheet_to_json(sheet, { header: filteredHeader });
	  
		  const extractedData = data
			.filter(row => row.C)
			.map(row => ({
			  theme: row.B,
			  owner: row.C,
			  telegramId: row.D,
			}))
			.slice(1);
	  
		  const usersArray = await module.exports.assignRandomFriday(extractedData);
		  await tableService.createMany(usersArray);
	  
		  ctx.reply(
			'Excel file data from the external link has been successfully added to MongoDB.',
			{ reply_markup: botConstants.mainMenuKeyboard }
		  );
		} catch (error) {
		  console.error('Error handling external file link:', error);
		  ctx.reply('Error handling the external file link.');
		}
	  },

    assignRandomFriday: async (usersArray) => {
        const fridayDates = [];

        let currentDate = dayjs().startOf('day').day(5);

        while (fridayDates.length < usersArray.length) {
            fridayDates.push(currentDate.clone().hour(19).minute(30));
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

    showList: async (ctx) => {
        const usersArray = await tableService.findAll();
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
            reply_markup: botConstants.mainMenuKeyboard,
        });
    },
};
