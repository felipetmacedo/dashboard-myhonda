import BaseModel from './base';

export default class UserPermission extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			},
			permissionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'permission_id'
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'user_id'
			},
			creatorId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'creator_id'
			},
			storeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'store_id'
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: false,
			sequelize: sequelize,
			modelName: 'user_permission',
			tableName: 'new_user_permissions',
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		});
	}

	static associate(models) {
		this.belongsTo(models.permission, { foreignKey: 'permission_id' });
		this.belongsTo(models.user, { foreignKey: 'user_id' });
		this.belongsTo(models.user, { foreignKey: 'creator_id', as: 'creator' });
		this.belongsTo(models.store, { foreignKey: 'store_id' });
	}
}
