const config = require('./config');

const json = {
	dialect: config.databases.dialect,
	host: config.databases.master.host,
	username: config.databases.master.username,
	database: config.databases.dbname,
	password: config.databases.master.password,
	port: config.databases.master.port,
};

module.exports = {
	test: json,
	production: json,
	development: json
};
