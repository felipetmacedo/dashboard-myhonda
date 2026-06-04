import cors from 'cors';
import http from 'http';
import dayjs from 'dayjs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import Routes from './routes.js';

import Database from './database.js';

export default class App {
	constructor() {
		if (process.env.NODE_ENV !== 'production') {
			dotenv.config({ path: `${__dirname}/../.env` });
		}

		this.app = express();
		this.databaseModule = new Database();
		this.port = process.env.PORT || '3000';
		this.httpServer = http.createServer(this.app);
	}

	async setup() {
		const routes = new Routes();

		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(cors({
			origin: '*',
			credentials: false,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: '*'
		}));
		this.app.use(helmet());

		this.app.use(routes.setup());

		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.extend(customParseFormat);
		dayjs.tz.setDefault('America/Recife');

		this.app.use((error, req, res, next) => {
			if (error) {
				res.status(500).json({
					status: 'error',
					code: 500,
					message: 'Algo de errado aconteceu'
				});
				return;
			}

			next();
		});
	}

	async initializeModules() {
		await this.databaseModule.connect();

		console.log('Database is connected');
	}

	gracefulStop() {
		return () => {
			this.httpServer.close(async error => {
				return error ? process.exit(1) : process.exit(0);
			});
		};
	}

	async start() {
		await this.initializeModules();

		this.httpServer.listen(this.port, () => {
			console.log(`Server running port ${this.port}`);
			this.setup();
		});

		process.on('SIGINT', this.gracefulStop());
	}
}
