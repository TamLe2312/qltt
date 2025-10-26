const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");
const { deleteImages } = require("../middlewares/multerConfig.js");

const getAllProducts = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "p.id",
      sku: "p.sku",
      name: "p.name",
      price: "p.price",
      status: "p.status",
      created_at: "p.created_at",
      category_name: "c.name",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const results = await dbHeadOffice.query(
      `SELECT 
        p.id, p.sku, p.avatar, p.name, p.unit_of_measure, p.status, p.price, p.created_at
       FROM products p
       WHERE p.deleted_at IS NULL
       ORDER BY ${sortColumn} ${sortDir}
       OFFSET ? ROWS
       FETCH NEXT ? ROWS ONLY`,
      {
        replacements: [offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalResult = await dbHeadOffice.query(
      `SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL`,
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: {
        items: results,
        pagination: {
          total,
          pageNum,
          perPage: limitNum,
          totalPages,
        },
        sort: {
          field: sortColumn,
          order: sortDir,
        },
      },
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const createProduct = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  const uploadedFiles = [];
  if (req.files.avatar) {
    uploadedFiles.push(req.files.avatar[0].path);
  }
  if (req.files.images) {
    req.files.images.forEach((file) => uploadedFiles.push(file.path));
  }
  try {
    const {
      price,
      status,
      unit_of_measure,
      short_description,
      description,
      name,
      category_id,
    } = req.body;

    const avatarFilename = req.files.avatar
      ? req.files.avatar[0].filename
      : null;
    const imageFilenames = req.files.images
      ? req.files.images.map((file) => file.filename)
      : [];

    const result = await dbHeadOffice.query(
      `INSERT INTO products 
        (price, status, unit_of_measure, short_description, description, name, category_id, avatar)
       VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)

        SELECT SCOPE_IDENTITY() AS id;
        `,
      {
        replacements: [
          price,
          status,
          unit_of_measure,
          short_description,
          description,
          name,
          category_id,
          avatarFilename,
        ],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!result || result.length === 0 || !result[0].id) {
      throw new Error("Product creation failed, no ID returned.");
    }

    const newProductId = result[0].id;

    if (imageFilenames.length > 0) {
      const placeholders = imageFilenames.map(() => `(?, ?, ?)`).join(", ");

      const replacements = imageFilenames.flatMap((filename, index) => [
        newProductId,
        filename,
        index,
      ]);

      await dbHeadOffice.query(
        `INSERT INTO ProductImages (product_id, imageURL, sortOrder) 
         VALUES ${placeholders}`,
        {
          replacements: replacements,
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    await t.rollback();
    if (uploadedFiles.length > 0) {
      try {
        await deleteImages(uploadedFiles);
      } catch (error) {
        console.error("Error deleting uploaded files:", error);
      }
    }
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateProduct = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  const uploadedFiles = [];
  if (req.files.avatar) {
    uploadedFiles.push(req.files.avatar[0].path);
  }
  if (req.files.images) {
    req.files.images.forEach((file) => uploadedFiles.push(file.path));
  }
  const filesToDelete = [];
  try {
    const { id } = req.params;
    const {
      price,
      status,
      unit_of_measure,
      short_description,
      description,
      name,
      category_id,
    } = req.body;
    const avatarFilename = req.files.avatar
      ? req.files.avatar[0].filename
      : null;
    const imageFilenames = req.files.images
      ? req.files.images.map((file) => file.filename)
      : null;

    const oldProductResult = await dbHeadOffice.query(
      "SELECT avatar FROM products WHERE id = ?",
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    const oldImagesResult = await dbHeadOffice.query(
      "SELECT imageURL FROM ProductImages WHERE product_id = ?",
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    if (oldProductResult.length === 0 || oldImagesResult.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    const oldAvatar = oldProductResult[0].avatar;

    await dbHeadOffice.query(
      `UPDATE products 
       SET price=?, status=?, unit_of_measure=?, short_description=?, description=?, name=?, category_id=?, avatar=COALESCE(?, avatar), updated_at=SYSDATETIME()
       OUTPUT INSERTED.*
       WHERE id = ?`,
      {
        replacements: [
          price,
          status,
          unit_of_measure,
          short_description,
          description,
          name,
          category_id,
          avatarFilename,
          id,
        ],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (imageFilenames.length > 0) {
      oldImagesResult.forEach((img) => filesToDelete.push(img.imageURL));
      await dbHeadOffice.query(
        "DELETE FROM ProductImages WHERE product_id = ?",
        { replacements: [id], type: QueryTypes.DELETE, transaction: t }
      );
      const placeholders = imageFilenames.map(() => `(?, ?, ?)`).join(", ");
      const replacements = imageFilenames.flatMap((filename, index) => [
        id,
        filename,
        index,
      ]);
      await dbHeadOffice.query(
        `INSERT INTO ProductImages (product_id, imageURL, sortOrder) 
         VALUES ${placeholders}`,
        {
          replacements: replacements,
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    if (avatarFilename && oldAvatar) {
      filesToDelete.push(oldAvatar);
    }

    await t.commit();

    if (filesToDelete.length > 0) {
      try {
        await deleteImages(filesToDelete);
      } catch (deleteErr) {
        console.error("Failed to delete old files:", deleteErr);
      }
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    await t.rollback();
    if (uploadedFiles.length > 0) {
      try {
        await deleteImages(uploadedFiles);
      } catch (error) {
        console.error("Error deleting uploaded files:", error);
      }
    }
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteProduct = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  const filesToDelete = [];
  try {
    const { id } = req.params;

    const oldProductResult = await dbHeadOffice.query(
      "SELECT avatar FROM products WHERE id = ?",
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    const oldImagesResult = await dbHeadOffice.query(
      "SELECT imageURL FROM ProductImages WHERE product_id = ?",
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    if (oldProductResult.length === 0 || oldImagesResult.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    const oldAvatar = oldProductResult[0].avatar;

    const [result, metadata] = await dbHeadOffice.query(
      "DELETE FROM products WHERE id = ? AND deleted_at IS NULL",
      {
        replacements: [id],
        transaction: t,
      }
    );

    if (metadata.affectedCount === 0) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    }

    if (oldImagesResult.length > 0) {
      oldImagesResult.forEach((img) => filesToDelete.push(img.imageURL));

      await dbHeadOffice.query(
        "DELETE FROM ProductImages WHERE product_id = ?",
        { replacements: [id], type: QueryTypes.DELETE, transaction: t }
      );
    }

    if (oldAvatar) {
      filesToDelete.push(oldAvatar);
    }
    await t.commit();
    if (filesToDelete.length > 0) {
      try {
        await deleteImages(filesToDelete);
      } catch (deleteErr) {
        console.error("Failed to delete old files:", deleteErr);
      }
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

module.exports = {
  productController: {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  },
};
