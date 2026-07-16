const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PasswordReset = sequelize.define(
    'PasswordReset',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      usedAt: {
        type: DataTypes.DATE,
        field: 'used_at',
      },
    },
    {
      tableName: 'password_resets',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['token'] },
        { fields: ['expires_at'] },
      ],
    }
  );

  return PasswordReset;
};
