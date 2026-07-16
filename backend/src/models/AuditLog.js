const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        index: true,
        field: 'user_id',
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
      },
      resourceType: {
        type: DataTypes.STRING,
        field: 'resource_type',
      },
      resourceId: {
        type: DataTypes.STRING,
        field: 'resource_id',
      },
      changes: {
        type: DataTypes.JSON,
      },
      ipAddress: {
        type: DataTypes.STRING,
        field: 'ip_address',
      },
      userAgent: {
        type: DataTypes.TEXT,
        field: 'user_agent',
      },
      status: {
        type: DataTypes.ENUM('success', 'failure'),
        defaultValue: 'success',
      },
      details: {
        type: DataTypes.JSON,
      },
    },
    {
      tableName: 'audit_logs',
      indexes: [
        { fields: ['user_id', 'created_at'] },
        { fields: ['action', 'created_at'] },
        { fields: ['created_at'] },
      ],
    }
  );

  return AuditLog;
};
