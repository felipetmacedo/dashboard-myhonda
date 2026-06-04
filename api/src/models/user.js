import BaseModel from './base';
import bcryptjs from 'bcryptjs';

export default class User extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			},
			isEmailVerified: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_email_verified'
			},
			address_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'addresses',
					key: 'id'
				}
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_admin'
			},
			document: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phone_number: {
				type: DataTypes.STRING,
				allowNull: true,
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'user',
			tableName: 'users',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			hooks: {
				beforeCreate: user => {
					user.password = bcryptjs.hashSync(user.password, 10);
				}
			}
		});
	}

	/**
	 * Set up model associations.
	 *
	 * @param {Object} models - Models from sequelize.
	 *
	 * @returns {undefined}
	 */
	static associate(models) {
		this.hasOne(models.member, {
			foreignKey: 'user_id'
		});

		this.hasMany(models.member, {
			foreignKey: 'user_id'
		});

		this.hasMany(models.user_permission, {
			foreignKey: 'user_id',
			as: 'permissions'
		});

		this.belongsTo(models.address, { foreignKey: 'address_id' });
	}
}
