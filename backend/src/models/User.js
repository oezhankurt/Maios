const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const config = require('../config');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false },

      amazonSellerId: { type: DataTypes.STRING },
      amazonAccessToken: { type: DataTypes.TEXT },
      amazonRefreshToken: { type: DataTypes.TEXT },

      timezone: { type: DataTypes.STRING, defaultValue: 'Europe/Berlin' },
      language: { type: DataTypes.STRING, defaultValue: 'en' },
      currency: { type: DataTypes.STRING, defaultValue: 'EUR' },

      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified',
      },
    },
    {
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['passwordHash', 'amazonAccessToken', 'amazonRefreshToken'] },
      },
      scopes: {
        withSecret: { attributes: { include: ['passwordHash'] } },
      },
      indexes: [{ unique: true, fields: ['email'] }, { fields: ['status'] }],
    }
  );

  User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.hashPassword = function (password) {
    return bcrypt.hash(password, config.bcryptRounds);
  };

  return User;
};
