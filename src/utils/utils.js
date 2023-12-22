const dayjs = require('dayjs');

module.exports = {
	usersListParses: async list => {
		return list
			.split('\n======================================\n')
			.filter(row => row.trim() !== '')
			.map(row => {
				const [indexPart, detailsPart] = row.split('. ');
				const index = parseInt(indexPart);
				const [namePart, themePart, datePart] = detailsPart.split('\n');
				const owner = namePart.split(': ')[1];
				const theme = themePart.split(': ')[1];
				const presentationDate = datePart.split(': ')[1];
				return { index, owner, theme, presentationDate };
			});
	},

	assignRandomFriday: async usersArray => {
		const fridayDates = [];

		let currentDate = dayjs()
			.startOf('day')
			.add('17', 'hours')
			.add('30', 'minutes')
			.day(5);

		while (fridayDates.length < usersArray.length) {
			fridayDates.push(currentDate.clone());
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
