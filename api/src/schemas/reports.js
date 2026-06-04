import * as yup from 'yup';

export default {
	leads: {
		query: yup.object().shape({
			dataInicio: yup.string().required(),
			dataFinal: yup.string().required(),
			codhda: yup.string().required(),
		})
	}
};
