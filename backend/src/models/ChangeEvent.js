const { DataTypes } = require('sequelize');

/**
 * Records a change to a product's listing/price so its impact can be measured
 * (before vs. after) — e.g. "did rewriting the bullets improve conversion?".
 */
module.exports = (sequelize) => {
  const ChangeEvent = sequelize.define(
    'ChangeEvent',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
      field: { type: DataTypes.STRING, allowNull: false },
      oldValue: { type: DataTypes.TEXT },
      newValue: { type: DataTypes.TEXT },
    },
    {
      tableName: 'change_events',
      updatedAt: false,
      indexes: [{ fields: ['product_id'] }, { fields: ['user_id'] }, { fields: ['created_at'] }],
    }
  );

  return ChangeEvent;
};
