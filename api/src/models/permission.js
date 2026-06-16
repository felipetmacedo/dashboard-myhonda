import BaseModel from './base';

export default class Permission extends BaseModel {
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
			permissionModuleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'permission_module_id'
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			}
		}, {
			paranoid: false,
			timestamps: false,
			underscored: false,
			sequelize: sequelize,
			modelName: 'permission',
			tableName: 'new_permissions',
		});
	}

	static associate(models) {
		this.belongsTo(models.permission_module, { foreignKey: 'permission_module_id', as: 'module' });
	}
}
