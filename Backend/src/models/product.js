"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Một sản phẩm thuộc về 1 danh mục
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
      // Một sản phẩm có nhiều hình ảnh
      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "images",
      });
      // Một sản phẩm có trong nhiều kho
      Product.hasMany(models.Inventory, {
        foreignKey: "product_id",
        as: "inventories",
      });
      // Một sản phẩm có trong nhiều chi tiết đơn hàng
      Product.hasMany(models.OrderDetail, {
        foreignKey: "product_id",
        as: "orderDetails",
      });
    }
  }
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(100), // VARCHAR(100)
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING(255), // NVARCHAR(255)
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "categories",
          key: "id",
        },
      },
      price: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avatar: {
        type: DataTypes.TEXT, // NVARCHAR(MAX)
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "Active",
        validate: {
          isIn: [["Active", "Inactive", "OutOfStock", "Discontinued"]],
        },
      },
      unit_of_measure: {
        type: DataTypes.STRING(50), // NVARCHAR(50)
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      short_description: {
        type: DataTypes.STRING(500), // NVARCHAR(500)
      },
      description: {
        type: DataTypes.TEXT, // NVARCHAR(MAX)
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
      modelName: "Product",
      tableName: "products",
      timestamps: false,
    }
  );
  return Product;
};
