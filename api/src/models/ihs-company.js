import BaseModel from './base';

export default class IhsCompany extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			ihscompany_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			codhda: {
				type: DataTypes.STRING(10),
				allowNull: true,
			},
			empresa: {
				type: DataTypes.STRING(30),
				allowNull: true,
			},
			sigla_loja: {
				type: DataTypes.STRING(10),
				allowNull: true,
			},
			cnpj: {
				type: DataTypes.STRING(14),
				allowNull: true,
			},
			ihscompany_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			ativa: {
				type: DataTypes.TINYINT,
				allowNull: true,
				defaultValue: 1,
			},
		}, {
			paranoid: false,
			timestamps: false,
			underscored: true,
			sequelize: sequelize,
			modelName: 'ihs_company',
			tableName: 'commerce_sfs_ihscompanies',
		});
	}
}
