import { ExceptionUtils } from '@utils';

export default class BaseController {
	constructor() {
		this.sendSuccess = this.sendSuccess.bind(this);
		this.sendError = this.sendError.bind(this);
	}

	sendError({ error, req, res }) {
		const isExceptionUtils = error instanceof ExceptionUtils;
		const statusCode = isExceptionUtils && error.status_code || 500;

		if (isExceptionUtils) {
			res.status(statusCode).json({
				status: 'error',
				code: error.code,
				data: error.data,
				message: error.message || 'Algo de errado ocorreu, por favor, tente novamente.'
			});
			return;
		}

		res.status(statusCode).json({
			status: 'error',
			code: 500,
			message: error.message || 'Algo de errado ocorreu, por favor, tente novamente.'
		});
	}

	sendSuccess({ data, res }) {
		if (data && data.error_key) {
			const response = {
				status: 'error',
				message: 'Ops.. algo de errado aconteceu, tente novamente.'
			};

			if (data.error_key === 'NO_RESULTS') {
				response.code = data.error_key;
			}

			return res.status(200).json(response);
		}

		return res.status(200).json({
			status: 'success',
			data: data
		});
	}
}
