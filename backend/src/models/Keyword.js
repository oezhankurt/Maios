const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Keyword = sequelize.define(
    'Keyword',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      keyword: { type: DataTypes.STRING, allowNull: false },
      keywordType: {
        type: DataTypes.ENUM('organic', 'sponsored', 'branded', 'competitor'),
        defaultValue: 'organic',
      },

      searchVolume: { type: DataTypes.INTEGER, defaultValue: 0 },
      cpc: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      difficultyScore: { type: DataTypes.INTEGER, defaultValue: 0 },

      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'keywords',
      indexes: [
        { fields: ['product_id'] },
        { fields: ['keyword'] },
        { fields: ['status'] },
      ],
    }
  );

  return Keyword;
};
