module.exports = {
	// cases
	createChat: 'createChat',

	presentationList: 'presentationList',
	uploadFile: 'uploadFile',
	uploadFileLink: 'uploadFileLink',

	close: 'mainClose',

	// keyboard
	welcomeMenuKeyboard: {
		inline_keyboard: [[{ text: 'Add bot to chat', callback_data: 'createChat' }]],
	},

	mainMenuKeyboard: {
		inline_keyboard: [
			[{ text: '📅 Presentation List', callback_data: 'presentationList' }],
			[
				{ text: '📁 Upload Excel File', callback_data: 'uploadFile' },
				{ text: '🌐 Sent Excel File Link', callback_data: 'uploadFileLink' },
			],
			[{ text: '❌ Close', callback_data: 'mainClose' }],
		],
	},
};
