"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Một Role thuộc về nhiều User
      Role.belongsToMany(models.User, {
        through: "user_roles",
        foreignKey: "role_id",
        as: "users",
      });
      // Một Role có nhiều Permission
      Role.belongsToMany(models.Permission, {
        through: "role_permission",
        foreignKey: "role_id",
        as: "permissions",
      });
    }
  }
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT, // NVARCHAR(MAX)
        allowNull: false,
        validate: { notEmpty: true },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("SYSDATETIME"),
      },
      updated_at: {
        type: DataTypes.DATE,
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
      modelName: "Role",
      tableName: "roles",
      timestamps: false,
    }
  );
  return Role;
};
