const TableModel = require('../dataBase/Table');

module.exports = {
	createMany: async data => {
		await TableModel.insertMany(data);
	},

	findAll: async () => {
		return await TableModel.find();
	},

	findQuery: async query => {
		const result = await TableModel.find(query);
		if (!result) {
			console.error('user not founded');
		}

		return result;
	},
};
