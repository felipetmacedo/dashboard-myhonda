const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function normalizePath(prefix, path) {
	const cleanedPrefix = prefix === '/' ? '' : prefix.replace(/\/$/, '');
	const cleanedPath = path === '/' ? '' : String(path).replace(/^\//, '');
	const fullPath = `${cleanedPrefix}/${cleanedPath}`.replace(/\/+/g, '/');

	if (!fullPath || fullPath === '') {
		return '/';
	}

	return fullPath.replace(/:(\w+)/g, '{$1}');
}

function mapType(type) {
	switch (type) {
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		case 'array':
			return 'array';
		case 'object':
			return 'object';
		case 'date':
			return 'string';
		default:
			return 'string';
	}
}

function hasTest(description, name) {
	return (description.tests || []).some(test => test.name === name);
}

function yupDescriptionToOpenApi(description) {
	if (!description) {
		return { type: 'object' };
	}

	if (description.type === 'object') {
		const properties = {};
		const required = [];
		const fields = description.fields || {};

		Object.keys(fields).forEach(fieldName => {
			const fieldSchema = yupDescriptionToOpenApi(fields[fieldName]);
			properties[fieldName] = fieldSchema;

			if (hasTest(fields[fieldName], 'required')) {
				required.push(fieldName);
			}
		});

		const schema = {
			type: 'object',
			properties
		};

		if (required.length) {
			schema.required = required;
		}

		return schema;
	}

	if (description.type === 'array') {
		return {
			type: 'array',
			items: yupDescriptionToOpenApi(description.innerType)
		};
	}

	const schema = {
		type: mapType(description.type)
	};

	if (description.type === 'date') {
		schema.format = 'date-time';
	}

	if (description.type === 'string' && hasTest(description, 'email')) {
		schema.format = 'email';
	}

	if (Array.isArray(description.oneOf) && description.oneOf.length) {
		schema.enum = description.oneOf;
	}

	const minTest = (description.tests || []).find(test => test.name === 'min');
	const maxTest = (description.tests || []).find(test => test.name === 'max');

	if (minTest && typeof minTest.params?.min !== 'undefined') {
		schema.minimum = minTest.params.min;
	}

	if (maxTest && typeof maxTest.params?.max !== 'undefined') {
		schema.maximum = maxTest.params.max;
	}

	return schema;
}

function extractSchemaFromMiddlewares(middlewares = []) {
	const validator = middlewares.find(middleware => middleware?.__openapi?.type === 'schema-validator');

	if (!validator) {
		return {};
	}

	return validator.__openapi.schema || {};
}

function extractSecurityFromMiddlewares(middlewares = []) {
	const needsBearer = middlewares.some(middleware => middleware?.__openapi?.security === 'bearerAuth');

	if (!needsBearer) {
		return undefined;
	}

	return [{ bearerAuth: [] }];
}

function extractPermissionNotes(middlewares = []) {
	const permissions = middlewares
		.filter(middleware => middleware?.__openapi?.type === 'permission')
		.map(middleware => middleware.__openapi.permission)
		.filter(Boolean);

	const isAdminOnly = middlewares.some(middleware => middleware?.__openapi?.admin === true);

	const notes = [];

	if (permissions.length) {
		notes.push(`Required permission: ${permissions.join(', ')}`);
	}

	if (isAdminOnly) {
		notes.push('Admin only endpoint.');
	}

	return notes;
}

function buildResponses(method) {
	const responses = {
		400: { description: 'Validation error' },
		401: { description: 'Unauthorized' },
		403: { description: 'Forbidden' },
		404: { description: 'Not found' },
		500: { description: 'Internal server error' }
	};

	if (method === 'post') {
		responses[201] = { description: 'Created' };
		return responses;
	}

	if (method === 'delete') {
		responses[204] = { description: 'No content' };
		return responses;
	}

	responses[200] = { description: 'Success' };
	return responses;
}

function buildOperationId(method, fullPath) {
	const clean = fullPath
		.replace(/[{}]/g, '')
		.replace(/\//g, '_')
		.replace(/^_+/, '');

	return `${method}_${clean || 'root'}`;
}

function extractTag(prefix) {
	const withoutSlash = prefix.replace(/^\//, '');
	if (!withoutSlash) {
		return 'default';
	}

	return withoutSlash.split('/')[0];
}

function buildOperation({ method, fullPath, middlewares, tag }) {
	const schemaBySource = extractSchemaFromMiddlewares(middlewares);
	const operation = {
		tags: [tag],
		summary: `${method.toUpperCase()} ${fullPath}`,
		operationId: buildOperationId(method, fullPath),
		responses: buildResponses(method)
	};

	const paramsSchema = schemaBySource.params;
	if (paramsSchema?.describe) {
		const paramsDescription = paramsSchema.describe();
		const properties = paramsDescription.fields || {};
		const requiredSet = new Set(
			Object.keys(properties).filter(key => hasTest(properties[key], 'required'))
		);

		operation.parameters = Object.keys(properties).map(name => ({
			name,
			in: 'path',
			required: true,
			schema: yupDescriptionToOpenApi(properties[name]),
			description: requiredSet.has(name) ? 'Required path parameter' : 'Path parameter'
		}));
	}

	const querySchema = schemaBySource.query;
	if (querySchema?.describe) {
		const queryDescription = querySchema.describe();
		const properties = queryDescription.fields || {};
		const requiredSet = new Set(
			Object.keys(properties).filter(key => hasTest(properties[key], 'required'))
		);

		const queryParameters = Object.keys(properties).map(name => ({
			name,
			in: 'query',
			required: requiredSet.has(name),
			schema: yupDescriptionToOpenApi(properties[name])
		}));

		operation.parameters = [...(operation.parameters || []), ...queryParameters];
	}

	const bodySchema = schemaBySource.body;
	if (bodySchema?.describe) {
		operation.requestBody = {
			required: true,
			content: {
				'application/json': {
					schema: yupDescriptionToOpenApi(bodySchema.describe())
				}
			}
		};
	}

	const security = extractSecurityFromMiddlewares(middlewares);
	if (security) {
		operation.security = security;
	}

	const notes = extractPermissionNotes(middlewares);
	if (notes.length) {
		operation.description = notes.join(' ');
	}

	return operation;
}

function readRoutesFromRouter(prefix, parentMiddlewares = [], router) {
	const paths = {};
	const stack = router?.stack || [];

	stack.forEach(layer => {
		if (!layer.route?.path || !layer.route?.methods) {
			return;
		}

		const routeMiddlewares = (layer.route.stack || []).map(item => item.handle).filter(Boolean);
		const allMiddlewares = [...parentMiddlewares, ...routeMiddlewares];
		const fullPath = normalizePath(prefix, layer.route.path);
		const methods = Object.keys(layer.route.methods).filter(method => HTTP_METHODS.includes(method));
		const tag = extractTag(prefix);

		paths[fullPath] = paths[fullPath] || {};

		methods.forEach(method => {
			paths[fullPath][method] = buildOperation({
				method,
				fullPath,
				middlewares: allMiddlewares,
				tag
			});
		});
	});

	return paths;
}

export function buildOpenApiSpec({ mounts = [], title = 'SIG API', version = '1.0.0' } = {}) {
	const paths = {};

	mounts.forEach(mount => {
		const routePaths = readRoutesFromRouter(mount.prefix, mount.middlewares || [], mount.router);
		Object.assign(paths, routePaths);
	});

	return {
		openapi: '3.0.3',
		info: {
			title,
			version
		},
		servers: [{ url: '/' }],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		},
		paths
	};
}
