const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KeywordRanking = sequelize.define(
    'KeywordRanking',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      keywordId: { type: DataTypes.UUID, allowNull: false },
      marketplace: { type: DataTypes.STRING, allowNull: false, defaultValue: 'amazon' },

      rankingPosition: { type: DataTypes.INTEGER },
      previousRanking: { type: DataTypes.INTEGER },
      rankDate: { type: DataTypes.DATEONLY, allowNull: false },
    },
    {
      tableName: 'keyword_rankings',
      indexes: [
        { fields: ['keyword_id'] },
        { fields: ['product_id'] },
        { fields: ['rank_date'] },
        { unique: true, fields: ['keyword_id', 'marketplace', 'rank_date'] },
      ],
    }
  );

  return KeywordRanking;
};
