"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      OrderDetail.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });
      OrderDetail.belongsTo(models.OrderCore, {
        foreignKey: "order_id",
        as: "order",
      });
      OrderDetail.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }
  OrderDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders_core",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      price: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
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
      modelName: "OrderDetail",
      tableName: "order_details",
      timestamps: false, // Không có created_at, updated_at
    }
  );
  return OrderDetail;
};
