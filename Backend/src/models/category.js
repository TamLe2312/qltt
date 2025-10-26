"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Một danh mục có thể thuộc về 1 danh mục cha
      Category.belongsTo(models.Category, {
        foreignKey: "parent_id",
        as: "parent",
      });
      // Một danh mục có thể có nhiều danh mục con
      Category.hasMany(models.Category, {
        foreignKey: "parent_id",
        as: "children",
      });
      // Một danh mục có nhiều sản phẩm
      Category.hasMany(models.Product, {
        foreignKey: "category_id",
        as: "products",
      });
    }
  }
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255), // NVARCHAR(255)
        allowNull: false,
        validate: {
          notEmpty: true, // CK_categories_name_not_empty
        },
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // DEFAULT NULL
        references: {
          model: "categories", // Tên bảng
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE, // DATETIME2
        defaultValue: sequelize.fn("SYSDATETIME"),
      },
      updated_at: {
        type: DataTypes.DATE, // DATETIME2
      },
      rowguid: {
        type: DataTypes.UUID, // uniqueidentifier
        allowNull: false,
        unique: true,
        defaultValue: sequelize.fn("NEWSEQUENTIALID"),
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: false,
    }
  );
  return Category;
};
