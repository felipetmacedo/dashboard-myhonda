export default class LoggerUtils {
	static getRequestInfo(req) {
		const connection = req.connection;
		const address = connection && connection.address && connection.address();
		const portNumber = address && address.port;
		const port = (!portNumber || portNumber === 80 || portNumber === 443) ? '' : `:${portNumber}`;
		const protocol = typeof req.protocol !== 'undefined' ? req.protocol : (req.connection.encrypted ? 'https' : 'http');
		const hostname = (req.hostname || req.host || req.headers.host || '').replace(/:\d+$/, '');
		const url = `${protocol}://${hostname}${port}${req.originalUrl}`;

		return {
			url: url,
			path: req.originalUrl || req.path || req.url,
			httpMethod: req.method,
			headers: req.headers,
			httpVersion: req.httpVersion,
			body: req.body,
			params: req.params,
			query: req.query,
			clientIp: req.ip || (connection ? connection.remoteAddress : undefined),
			referer: req.headers.referer || req.headers.referrer
		};
	}

	static error() {
		console.info(console.error(...arguments));
	}

	static success() {
		console.info(console.log(...arguments));
	}
}
