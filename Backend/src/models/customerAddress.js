"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CustomerAddress extends Model {
    static associate(models) {
      // Một địa chỉ thuộc về 1 User
      CustomerAddress.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  CustomerAddress.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      is_default: {
        type: DataTypes.BOOLEAN, // BIT
        defaultValue: true,
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      ward: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      district: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      zipcode: {
        type: DataTypes.STRING(255),
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
      modelName: "CustomerAddress",
      tableName: "customer_address",
      timestamps: false,
    }
  );
  return CustomerAddress;
};
