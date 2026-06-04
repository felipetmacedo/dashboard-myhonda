import BaseModel from './base';

export default class Member extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'user_id'
			},
			storeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'store_id'
			},
			creatorId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'creator_id'
			},
			destroyerId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				field: 'destroyer_id'
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: false,
			sequelize: sequelize,
			modelName: 'member',
			tableName: 'members',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}

	static associate(models) {
		this.belongsTo(models.store, { foreignKey: 'store_id' });
		this.belongsTo(models.user, { foreignKey: 'user_id' });
	}
}
