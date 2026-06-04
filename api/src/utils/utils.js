export default class Utils {
	static getLikeValue(value) {
		return `%${(value || '').replace(/'/g, `${''}''`)}%`;
	}

	static strip(number) {
		return (number || '').toString().replace(/[^\d]/g, '');
	}

	static generateRandomPassword(length = 10) {
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
		return password;
	}

	static verifierDigit(numbers) {
		numbers = numbers.split('').map(number => parseInt(number, 10));

		const modulus = numbers.length + 1;
		const mod = numbers.map((number, index) => number * (modulus - index)).reduce((buffer, number) => buffer + number) % 11;

		return (mod < 2 ? 0 : 11 - mod);
	}

	static isCPFValid(number, isNullable) {
		const BLACKLIST = ['00000000000', '11111111111', '22222222222', '33333333333', '44444444444', '55555555555', '66666666666', '77777777777', '88888888888', '99999999999', '12345678909' ];
		const stripped = this.strip(number);

		if (isNullable && !stripped) {
			return true;
		}

		// CPF must be defined
		if (!stripped) {
			return false;
		}

		// CPF must have 11 chars
		if (stripped.length !== 11) {
			return false;
		}

		// CPF can't be blacklisted
		if (BLACKLIST.includes(stripped)) {
			return false;
		}

		let numbers = stripped.substr(0, 9);

		numbers += this.verifierDigit(numbers);
		numbers += this.verifierDigit(numbers);

		return numbers.substr(-2) === stripped.substr(-2);
	}

	static queryCondition(condition, query, elseQuery) {
		return condition ? query : (elseQuery || '');
	}

	static generateEan13Code(id) {
		let total = 0;
		const generatedNumber = (Date.now() * Math.random() * Math.random()).toString().replace('.', '');
		const ean = `${id}${generatedNumber.slice(id.toString().length, 12)}`;
		const multiply = [1, 3];

		ean.split('').forEach((letter, index) => {
			total += parseInt(letter, 10) * multiply[index % 2];
		});

		const base = Math.ceil(total / 10) * 10;

		return `${ean}${base - total}`;
	}

	static getPaginationOptions = (page, itemsPerPage) => {
		page = ~~page || 1;

		return {
			limit: itemsPerPage,
			offset: (page - 1) * itemsPerPage
		};
	};
}
