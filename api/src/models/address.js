import BaseModel from './base';

export default class Address extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init(
			{
				cep: {
					type: DataTypes.STRING,
					allowNull: false
				},
				address: {
					type: DataTypes.STRING,
					allowNull: false
				},
				number: {
					type: DataTypes.STRING,
					allowNull: false
				},
				complement: {
					type: DataTypes.STRING,
					allowNull: true
				},
				neighborhood: {
					type: DataTypes.STRING,
					allowNull: false
				},
				city: {
					type: DataTypes.STRING,
					allowNull: false
				},
				state: {
					type: DataTypes.STRING(2),
					allowNull: false
				}
			},
			{
				paranoid: false,
				timestamps: true,
				underscored: true,
				sequelize: sequelize,
				modelName: 'address',
				tableName: 'addresses',
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}

	static associate(models) {
		this.hasOne(models.store, { foreignKey: 'address_id' });
		this.hasOne(models.user, { foreignKey: 'address_id' });
	}
}
