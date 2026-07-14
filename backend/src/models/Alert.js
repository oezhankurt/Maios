const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define(
    'Alert',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID },
      type: {
        type: DataTypes.ENUM(
          'ranking_drop',
          'acos_high',
          'price_drop',
          'competitor_price',
          'low_stock',
          'recommendation'
        ),
        allowNull: false,
      },
      severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        defaultValue: 'info',
      },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      status: {
        type: DataTypes.ENUM('active', 'read', 'dismissed'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'alerts',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['product_id'] },
        { fields: ['status'] },
        { fields: ['type'] },
      ],
    }
  );

  return Alert;
};
