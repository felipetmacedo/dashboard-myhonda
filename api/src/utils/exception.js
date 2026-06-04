export default class ExceptionUtils {
	constructor(error) {
		this.name = 'ExceptionUtils';
		this.code = error.code;
		this.status_code = error.status || 500;
		this.message = error.message || 'Algo de errado ocorreu, por favor, tente novamente.';
	}
}
