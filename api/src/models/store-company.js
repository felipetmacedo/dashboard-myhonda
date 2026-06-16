import BaseModel from './base';

export default class StoreCompany extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			storeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'store_id'
			},
			codhda: {
				type: DataTypes.STRING(10),
				allowNull: false
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'store_company',
			tableName: 'new_store_companies',
			createdAt: 'created_at',
			updatedAt: false,
		});
	}

	static associate(models) {
		this.belongsTo(models.store, { foreignKey: 'store_id' });
		this.belongsTo(models.ihs_company, {
			foreignKey: 'codhda',
			targetKey: 'codhda',
			as: 'company'
		});
	}
}
