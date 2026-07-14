const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PPCPerformance = sequelize.define(
    'PPCPerformance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campaignId: { type: DataTypes.UUID, allowNull: false },
      performanceDate: { type: DataTypes.DATEONLY, allowNull: false },

      impressions: { type: DataTypes.INTEGER, defaultValue: 0 },
      clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
      spend: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      sales: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      unitsSold: { type: DataTypes.INTEGER, defaultValue: 0 },

      cpc: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      ctr: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      acos: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      roas: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
    },
    {
      tableName: 'ppc_performance',
      indexes: [
        { fields: ['campaign_id'] },
        { fields: ['performance_date'] },
        { unique: true, fields: ['campaign_id', 'performance_date'] },
      ],
    }
  );

  return PPCPerformance;
};
