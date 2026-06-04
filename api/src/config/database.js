require('dotenv').config();

module.exports = {
	options: {
		host: process.env.DB_HOST || process.env.DB_HOST,
		dialect: 'postgres',
		port: process.env.DB_PORT || 5432,
		logging: false,
		pool: {
			max: process.env.DB_CONNECTION || 5,
			min: process.env.DB_CONNECTION_MIN || 1,
			idle: 10000,
			acquire: 30000
		}
	},
	aws: {
		region: process.env.AWS_REGION || 'us-east-1',
		bucket: process.env.AWS_S3_BUCKET,
		bucket_url: process.env.AWS_S3_BUCKET_URL,
		prefix: process.env.AWS_S3_PREFIX,
		accelerate_prefix: process.env.AWS_S3_ACCELERATE_PREFIX,
		accessKeyId: process.env.AWS_S3_ACCESS_KEY,
		secretAccessKey: process.env.AWS_S3_SECRET_KEY,
		expires_in_seconds: {
			default: process.env.AWS_S3_EXPIRES_IN_SECONDS_DEFAULT || 604800
		}
	}
};
