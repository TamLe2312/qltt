"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: "role_id" });
      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permission_id",
      });
    }
  }
  RolePermission.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      rowguid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize.fn("NEWSEQUENTIALID"),
      },
    },
    {
      sequelize,
      modelName: "RolePermission",
      tableName: "role_permission",
      timestamps: false,
    }
  );
  return RolePermission;
};
