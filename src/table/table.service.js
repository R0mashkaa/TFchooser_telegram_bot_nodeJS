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

	updateThemeByName: async (user, data) => {
		return await TableModel.updateOne({ owner: user.owner }, { theme: data });
	},

	updateFieldByName: async (field, userName, data) => {
		return await TableModel.updateOne({ owner: userName }, { [field]: data });
	},

	deleteManyAndCreate: async data => {
		await TableModel.deleteMany({});
		await TableModel.insertMany(data);
	},
};
