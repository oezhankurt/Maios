const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmailVerification = sequelize.define(
    'EmailVerification',
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      verifiedAt: {
        type: DataTypes.DATE,
        field: 'verified_at',
      },
    },
    {
      tableName: 'email_verifications',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['token'] },
        { fields: ['expires_at'] },
      ],
    }
  );

  return EmailVerification;
};
