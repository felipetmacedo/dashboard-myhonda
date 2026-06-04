import BaseModel from './base';

export default class Store extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			razao_social: {
				type: DataTypes.STRING,
				allowNull: false
			},
			nome_fantasia: {
				type: DataTypes.STRING,
				allowNull: false
			},
			inscricao_estadual: {
				type: DataTypes.STRING,
				allowNull: true
			},
			inscricao_municipal: {
				type: DataTypes.STRING,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				defaultValue: null,
				allowNull: true
			},
			cnpj: {
				type: DataTypes.STRING,
				allowNull: false
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			is_deleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			address_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'addresses',
					key: 'id'
				}
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'store',
			tableName: 'stores',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}

	static associate(models) {
		this.hasMany(models.member, { foreignKey: 'store_id' });
		this.belongsTo(models.address, { foreignKey: 'address_id' });
	}
}
