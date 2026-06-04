import BaseModel from './base';

export default class UserRecoverPassword extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			used: {
				type: DataTypes.BOOLEAN
			},
			token: {
				type: DataTypes.STRING
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: 'user_id'
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: false,
			sequelize: sequelize,
			modelName: 'user_recover_password',
			tableName: 'user_recover_passwords',
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		});
	}

	static associate(models) {
		this.belongsTo(models.user, {
			foreignKey: 'user_id'
		});
	}
}
