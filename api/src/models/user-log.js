import BaseModel from './base';

export default class UserLog extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			type: {
				type: DataTypes.STRING,
				allowNull: false
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'user_id'
			},
			targetUserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'target_user_id'
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
			modelName: 'user_log',
			tableName: 'user_logs',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}
}
