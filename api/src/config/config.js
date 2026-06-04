require('dotenv').config();

const required = (name) => {
	const value = process.env[name];
	if (!value) throw new Error(`[config] Variável de ambiente obrigatória não definida: ${name}`);
	return value;
};

module.exports = {
	autentique: {
		apiUrl: process.env.AUTENTIQUE_API_URL || 'https://api.autentique.com.br/v2',
		apiToken: process.env.AUTENTIQUE_API_TOKEN,
	},
	databases: {
		dialect: 'mysql',
		master: {
			host: required('SFSEA_DB_HOST'),
			username: required('SFSEA_DB_USER'),
			password: required('SFSEA_DB_PASSWORD'),
			port: process.env.SFSEA_DB_PORT || process.env.DB_PORT || 3306,
		},
		dbname: required('SFSEA_DB_NAME'),
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
			default: process.env.AWS_S3_EXPIRES_IN_SECONDS_DEFAULT || 604800,
		},
	},
	app: {
		secretKey: required('APP_SECRET_KEY'),
		port: process.env.PORT || 3000,
		env: process.env.NODE_ENV || 'development',
	},
	nodemailer: {
		host: process.env.SMTP_ADDRESS,
		port: process.env.SMTP_PORT,
		secure: process.env.SMTP_SSL,
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	},
	email: {
		from: process.env.MAILER_SENDER_EMAIL,
		domain: process.env.SMTP_DOMAIN,
	},
	client: {
		baseUrl: process.env.CLIENT_BASE_URL,
	},
};
