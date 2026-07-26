import BaseModel from './base';

export default class PermissionModule extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			key: {
				type: DataTypes.STRING,
				allowNull: false
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			},
			system: {
				type: DataTypes.STRING(20),
				allowNull: false,
				defaultValue: 'sagzap',
			}
		}, {
			paranoid: false,
			timestamps: false,
			underscored: false,
			sequelize: sequelize,
			modelName: 'permission_module',
			tableName: 'new_permission_modules',
		});
	}
}
