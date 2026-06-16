import BaseModel from './base';

export default class Store extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			is_deleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'store',
			tableName: 'new_stores',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}

	static associate(models) {
		this.hasMany(models.member, { foreignKey: 'store_id' });
		this.hasMany(models.store_company, { foreignKey: 'store_id', as: 'companies' });
	}
}
