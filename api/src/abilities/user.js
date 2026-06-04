import { defineAbility } from '@casl/ability';

const forUser = user =>
	defineAbility(can => {
		if (user?.permissions.length) {
			user.permissions.forEach(permission => {
				can(permission.name, permission.module);
			});
		}
	});

export default {
	forUser
};
