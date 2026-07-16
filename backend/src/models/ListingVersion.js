const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ListingVersion = sequelize.define(
    'ListingVersion',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      listingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
      },
      versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Complete snapshot of listing at this version',
      },
      changes: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'What changed from previous version',
      },
      changeType: {
        type: DataTypes.ENUM('created', 'edited', 'optimized', 'published', 'restored'),
        defaultValue: 'edited',
      },
      changedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'User ID who made the change',
      },
      changeNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'listing_versions',
      timestamps: false,
      indexes: [
        { fields: ['listingId'] },
        { fields: ['versionNumber'] },
        { fields: ['createdAt'] },
      ],
    }
  );

  ListingVersion.associate = (models) => {
    ListingVersion.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
    });
  };

  return ListingVersion;
};
