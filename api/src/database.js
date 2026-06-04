import fs from 'fs';
import Sequelize from 'sequelize';

class Database {
	constructor() {
		this.models = {};
		this.databaseOptions = {
			dialect: 'mysql',
			port: Number(process.env.SFSEA_DB_PORT || process.env.DB_PORT || 3306),
			logging: false,
			pool: {
				max: 20,
				min: 0,
				idle: 10000,
				acquire: 30000
			},
			query: {
				raw: false
			},
			underscored: false,
			charset: 'utf8mb4',
			timezone: '+00:00'
		};

		this.masterInstance = this._masterInstance();
	}

	_masterInstance() {
		return new Sequelize(
			process.env.SFSEA_DB_NAME,
			process.env.SFSEA_DB_USER,
			process.env.SFSEA_DB_PASSWORD,
			{
				host: process.env.SFSEA_DB_HOST,
				...this.databaseOptions
			}
		);
	}

	_loadModels() {
		fs.readdirSync(`${__dirname}/models`, { withFileTypes: true })
			.filter(entry => fs.statSync(`${__dirname}/models/${entry.name}`).isFile())
			.map(entry => `${__dirname}/models/${entry.name}`)
			.forEach(filePath => {
				const Model = require(filePath).default;

				if (!Model || Model.name === 'BaseModel') {
					return;
				}

				const masterInstance = Model.load(this.masterInstance, Sequelize);

				this.models[Model.name] = masterInstance;
			});
	}

	_instantiateModels() {
		Object.values(this.models)
			.filter(model => typeof model.associate === 'function')
			.forEach(model => {
				model.models = this.models;
				model.sequelize = this.masterInstance;
				model.associate(this.models);
			});
	}

	_authenticate() {
		return this.masterInstance.authenticate();
	}

	disconnect() {
		return this.masterInstance.close()
			.then(() => console.log('Database is disconnected.'))
			.catch(error => console.log(`Database disconnection error: ${error}`));
	}

	connect() {
		this._loadModels();
		this._instantiateModels();

		return this._authenticate();
	}
}

export default Database;
