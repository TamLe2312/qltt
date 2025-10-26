"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Một user có nhiều địa chỉ
      User.hasMany(models.CustomerAddress, {
        foreignKey: "user_id",
        as: "addresses",
      });
      // Một user có nhiều đơn hàng
      User.hasMany(models.OrderCore, {
        foreignKey: "user_id",
        as: "orders",
      });
      // Một user thuộc về nhiều vai trò (Role)
      User.belongsToMany(models.Role, {
        through: "user_roles", // Tên bảng trung gian
        foreignKey: "user_id",
        as: "roles",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(255), // NVARCHAR(255)
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "Active",
        validate: {
          isIn: [["Active", "Inactive", "Blocked"]],
        },
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.TEXT, // VARCHAR(MAX)
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Tốt hơn CHECK LIKE
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          // Regex cho 0... và 10-11 số
          is: /^0\d{9,10}$/,
        },
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
      modelName: "User",
      tableName: "users",
      timestamps: false,
    }
  );
  return User;
};
