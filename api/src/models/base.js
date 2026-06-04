import { isArray, isObject } from 'lodash';
import { Model } from 'sequelize';

export default class BaseModel extends Model {
	static init() {
		return super.init(...arguments);
	}

	static scope(scopes) {
		let mountedScopes = [];

		if (isArray(scopes)) {
			mountedScopes = scopes.map(scope => this._getScope(scope));
		} else {
			mountedScopes = [this._getScope(scopes)];
		}

		return super.scope(...mountedScopes);
	}

	static _getScope(scope) {
		if (isObject(scope)) {
			const { name, options } = scope;

			return {
				method: [name, options]
			};
		}

		return scope;
	}

	static mountScope(scopeOptions, defaultOptions) {
		const options = Object.assign(defaultOptions, scopeOptions || {});

		return options;
	}
}
