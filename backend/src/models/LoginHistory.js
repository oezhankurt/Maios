const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoginHistory = sequelize.define(
    'LoginHistory',
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
      event: {
        type: DataTypes.ENUM('login', 'logout'),
        allowNull: false,
      },
      ipAddress: {
        type: DataTypes.STRING,
        field: 'ip_address',
      },
      userAgent: {
        type: DataTypes.TEXT,
        field: 'user_agent',
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'login_history',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'timestamp'] },
        { fields: ['timestamp'] },
      ],
    }
  );

  return LoginHistory;
};
