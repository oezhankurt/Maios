const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PPCCampaign = sequelize.define(
    'PPCCampaign',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      smartPortfolioId: { type: DataTypes.UUID },
      campaignName: { type: DataTypes.STRING, allowNull: false },
      campaignType: {
        type: DataTypes.ENUM('sp', 'sb', 'sd'),
        defaultValue: 'sp',
      },
      dailyBudget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      targetAcos: { type: DataTypes.DECIMAL(6, 2), defaultValue: 25 },
      status: {
        type: DataTypes.ENUM('active', 'paused', 'archived'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'ppc_campaigns',
      indexes: [
        { fields: ['product_id'] },
        { fields: ['status'] },
      ],
    }
  );

  return PPCCampaign;
};
