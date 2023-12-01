module.exports = {
	// user states
	waitForFile: 'waitingForResult',
	waitForLink: 'waitingForFile',

	// cases
	example1: 'example 1',
	example2: 'example 2',
	presentationList: 'Presentation list',
	uploadFile: 'Upload excel file',
	uploadFileLink: 'Sent excel file link',

	COMMAND_START: '/start',

	mainMenuKeyboard: {
		keyboard: [
			['example 1', 'example 2'],
			['Presentation list'],
			['Upload excel file'],
			['Sent excel file link'],
		],
		resize_keyboard: true,
		one_time_keyboard: false,
	},
};
