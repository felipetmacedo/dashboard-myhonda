import express from 'express';
import swaggerUi from 'swagger-ui-express';
import AuthRoutes from './routes/auth.js';
import UserRoutes from './routes/user.js';
import StoreRoutes from './routes/store.js';
import PermissionModuleRoutes from './routes/permission-module.js';
import PermissionRoutes from './routes/permission.js';
import ReportsRoutes from './routes/reports.js';
import { buildOpenApiSpec } from './docs/openapi-builder.js';

import { AuthMiddleware } from './middlewares/index.js';

class Routes {
	constructor() {
		this.routes = express.Router();
		this.openapi = null;
		this.authRoutes = new AuthRoutes();
		this.userRoutes = new UserRoutes();
		this.storeRoutes = new StoreRoutes();
		this.permissionModuleRoutes = new PermissionModuleRoutes();
		this.permissionRoutes = new PermissionRoutes();
		this.reportsRoutes = new ReportsRoutes();
	}

	setup() {
		const authRouter = this.authRoutes.setup();
		const userRouter = this.userRoutes.setup();
		const storeRouter = this.storeRoutes.setup();
		const permissionModuleRouter = this.permissionModuleRoutes.setup();
		const permissionRouter = this.permissionRoutes.setup();
		const reportsRouter = this.reportsRoutes.setup();

		const mounts = [
			{ prefix: '/auth', middlewares: [], router: authRouter },
			{ prefix: '/user', middlewares: [AuthMiddleware.isAuthorized], router: userRouter },
			{ prefix: '/store', middlewares: [AuthMiddleware.isAuthorized], router: storeRouter },
			{ prefix: '/permission-modules', middlewares: [AuthMiddleware.isAuthorized], router: permissionModuleRouter },
			{ prefix: '/permissions', middlewares: [AuthMiddleware.isAuthorized], router: permissionRouter },
			{ prefix: '/reports', middlewares: [], router: reportsRouter }
		];

		this.openapi = buildOpenApiSpec({
			mounts,
			title: 'MyHonda SFS API',
			version: process.env.npm_package_version || '1.0.0'
		});

		this.routes.get('/openapi.json', (req, res) => {
			res.status(200).json(this.openapi);
		});

		this.routes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.openapi));

		this.routes.get('/health', (req, res) => res.status(200).send('OK'));
		this.routes.use('/auth', authRouter);
		this.routes.use('/user', AuthMiddleware.isAuthorized, userRouter);
		this.routes.use('/store', AuthMiddleware.isAuthorized, storeRouter);
		this.routes.use('/permission-modules', AuthMiddleware.isAuthorized, permissionModuleRouter);
		this.routes.use('/permissions', AuthMiddleware.isAuthorized, permissionRouter);
		this.routes.use('/reports', reportsRouter);

		this.routes.use((error, req, res, next) => {
			if (error) {
				res.status(500).json({
					status: 'error',
					message: 'Algo de errado aconteceu'
				});
				return;
			}

			next();
		});

		return this.routes;
	}
}

export default Routes;
