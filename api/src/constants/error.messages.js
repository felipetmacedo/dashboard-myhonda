const EXPECTED_TYPE_NAME = {
	number: 'Número',
	string: 'texto'
};

export default {
	typeError: (field, value, expectedType) => `The value ${value} is invalid for the field ${field}. You must provide a ${EXPECTED_TYPE_NAME[expectedType]}.`,
	required: field => `The field ${field} is required.`,
	invalidFormat: (field, value) => `The value ${value} is invalid for the field ${field}.`,
	invalidDateRange: () => 'The start date cannot be after the end date.',
	length: (field, value, expectedType) => `The field ${field} needs to have ${expectedType} characters.`,
	oneOf: () => 'The provided fields need to be equal.',
	min: (field, value, expectedType) => `The field ${field} needs to have at least ${expectedType} characters.`,
	max: (field, value, expectedType) => `The field ${field} can have at most ${expectedType} characters.`,
	invalidExtension: () => 'File with invalid extension.'
};
