const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ListingTemplate = sequelize.define('ListingTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    templateData: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    platforms: {
      type: DataTypes.JSON,
      defaultValue: ['amazon', 'ebay', 'kaufland', 'otto'],
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'listing_templates',
    timestamps: true,
  });

  return ListingTemplate;
};
