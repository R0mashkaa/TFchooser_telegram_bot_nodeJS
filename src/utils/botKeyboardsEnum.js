module.exports = {
	WelcomeMenuKeyboard: {
		inline_keyboard: [[{ text: 'Add bot to chat', callback_data: 'createChat' }]],
	},

	MainMenuKeyboard: {
		inline_keyboard: [
			[{ text: '📅 Presentation List', callback_data: 'presentationList' }],
			[
				{ text: '📁 Upload Excel File', callback_data: 'uploadFile' },
				{ text: '🌐 Sent Excel File Link', callback_data: 'uploadFileLink' },
			],
			[
				{ text: '⚙️Update speaker theme', callback_data: 'updateUser' },
				{ text: '⚙️ Change spaker date', callback_data: 'swapSpeaker' },
			],
			[{ text: '❌ Close', callback_data: 'mainClose' }],
		],
	},
};
