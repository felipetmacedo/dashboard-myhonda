import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	login: {
		body: yup.object().shape({
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required()
		})
	},
	register: {
		body: yup.object().shape({
			token: yup.string().transform(sanitizeValue).optional(),
			phone_number: yup.string().transform(sanitizeValue).required(),
			document_number: yup.string().transform(sanitizeValue).required(),
			name: yup.string().transform(sanitizeValue).required(),
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required(),
			confirmPassword: yup.string()
				.transform(sanitizeValue)
				.required()
				.test('passwords-match', 'Passwords must match', function(value) {
					return value === this.parent.password;
				})
		})
	},
	verifyEmail: {
		query: yup.object().shape({
			token: yup.string().transform(sanitizeValue).required()
		})
	},
	requestResetPassword: {
		body: yup.object({
			email: yup.string().email().transform(sanitizeValue).max(255).required()
		}).noUnknown()
	},
	validateResetPassword: {
		query: yup.object().shape({
			token: yup.string().transform(sanitizeValue).required()
		}).noUnknown()
	},
	resetPassword: {
		body: yup.object().shape({
			password: yup.string().transform(sanitizeValue).required(),
			confirmPassword: yup.string()
				.transform(sanitizeValue)
				.required()
				.test('passwords-match', 'Passwords must match', function(value) {
					return value === this.parent.password;
				}),
			token: yup.string().required()
		}).noUnknown()
	}
};
