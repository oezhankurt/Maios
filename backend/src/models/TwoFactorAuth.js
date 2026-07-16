const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TwoFactorAuth = sequelize.define(
    'TwoFactorAuth',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        index: true,
        field: 'user_id',
      },
      secret: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_enabled',
      },
      backupCodes: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: 'backup_codes',
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        field: 'last_used_at',
      },
      enabledAt: {
        type: DataTypes.DATE,
        field: 'enabled_at',
      },
    },
    {
      tableName: 'two_factor_auth',
      indexes: [{ fields: ['user_id'] }],
    }
  );

  return TwoFactorAuth;
};
