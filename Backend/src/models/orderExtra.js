"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderExtra extends Model {
    static associate(models) {
      // Một order_extra thuộc về 1 order_core
      OrderExtra.belongsTo(models.OrderCore, {
        foreignKey: "order_id",
        as: "coreOrder",
      });
      OrderExtra.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });
    }
  }
  OrderExtra.init(
    {
      // order_id vừa là PK vừa là FK
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "orders_core",
          key: "id",
        },
      },
      branch_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "branches",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "Pending",
        validate: {
          isIn: [
            [
              "Pending",
              "Confirmed",
              "Processing",
              "Shipped",
              "Delivered",
              "Canceled",
              "Failed",
              "Refunded",
              "Completed",
            ],
          ],
        },
      },
      note: {
        type: DataTypes.TEXT,
      },
      total_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
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
      modelName: "OrderExtra",
      tableName: "orders_extra",
      timestamps: false,
    }
  );
  return OrderExtra;
};
