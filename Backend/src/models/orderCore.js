"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderCore extends Model {
    static associate(models) {
      OrderCore.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      OrderCore.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });
      // Một order_core có 1 order_extra
      OrderCore.hasOne(models.OrderExtra, {
        foreignKey: "order_id",
        as: "extraDetails",
      });
      // Một order_core có nhiều order_details
      OrderCore.hasMany(models.OrderDetail, {
        foreignKey: "order_id",
        as: "items",
      });
    }
  }
  OrderCore.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_code: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
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
      modelName: "OrderCore",
      tableName: "orders_core",
      timestamps: false,
    }
  );
  return OrderCore;
};
