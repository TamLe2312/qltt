"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // Một NCC có trong nhiều kho hàng
      Supplier.hasMany(models.Inventory, {
        foreignKey: "supplier_id",
        as: "inventories",
      });
    }
  }
  Supplier.init(
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
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
      modelName: "Supplier",
      tableName: "suppliers",
      timestamps: false,
    }
  );
  return Supplier;
};
