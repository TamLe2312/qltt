const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");
const { deleteImages } = require("../middlewares/multerConfig.js");

const getAllProducts = async (req, res) => {
  try {
    let { page = 1, page_size: limit = 20, sort_field: sortField = 'created_at', sort_order: sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT *
       FROM products
       WHERE products.deleted_at IS NULL
       ORDER BY ${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM products`);
    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: {
        items: result.rows,
        pagination: {
          total,
          page,
          perPage: limit,
          totalPages,
        },
        sort: {
          field: sortField,
          order: sortOrder,
        },
      },
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    handlePgError(err, res);
  }
};


const createProduct = async (req, res) => {
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

    await pool.query(
      `INSERT INTO products 
        (price, status, unit_of_measure, short_description, description, name, category_id, avatar, images) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        price,
        status,
        unit_of_measure,
        short_description,
        description,
        name,
        category_id,
        avatarFilename,
        imageFilenames,
      ]
    );

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    if (uploadedFiles.length > 0) {
      try {
        await deleteImages(uploadedFiles);
      } catch (error) {
        console.error("Error deleting uploaded files:", error);
      }
    }
    handlePgError(err, res);
  }
};

const updateProduct = async (req, res) => {
  const uploadedFiles = [];
  if (req.files.avatar) {
    uploadedFiles.push(req.files.avatar[0].path);
  }
  if (req.files.images) {
    req.files.images.forEach((file) => uploadedFiles.push(file.path));
  }
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

    await pool.query("BEGIN");

    const oldProductResult = await pool.query(
      "SELECT avatar, images FROM products WHERE id = $1",
      [id]
    );

    if (oldProductResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    const result = await pool.query(
      `UPDATE products 
       SET price=$1, status=$2, unit_of_measure=$3, short_description=$4, description=$5, name=$6, category_id=$7, avatar=COALESCE($8, avatar), images=COALESCE($9, images)
        WHERE id=$10
        RETURNING *`,
      [
        price,
        status,
        unit_of_measure,
        short_description,
        description,
        name,
        category_id,
        avatarFilename,
        imageFilenames,
        id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldProduct = oldProductResult.rows[0];
    await pool.query("COMMIT");
    const filesToDelete = [];
    if (oldProduct.avatar) {
      filesToDelete.push(oldProduct.avatar);
    }
    if (oldProduct.images) {
      filesToDelete.push(...oldProduct.images);
    }
    await deleteImages(filesToDelete);

    res.json({ message: "Product updated" });
  } catch (err) {
    if (uploadedFiles.length > 0) {
      try {
        await deleteImages(uploadedFiles);
      } catch (error) {
        console.error("Error deleting uploaded files:", error);
      }
    }
    handlePgError(err, res);
  }
};

// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query("BEGIN");

//     const oldProductResult = await pool.query(
//       "SELECT avatar, images FROM products WHERE id = $1",
//       [id]
//     );

//     if (oldProductResult.rowCount === 0) {
//       await pool.query("ROLLBACK");
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const result = await pool.query("DELETE FROM products WHERE id=$1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const oldProduct = oldProductResult.rows[0];

//     await pool.query("COMMIT");

//     const filesToDelete = [];
//     if (oldProduct.avatar) {
//       filesToDelete.push(oldProduct.avatar);
//     }
//     if (oldProduct.images) {
//       filesToDelete.push(...oldProduct.images);
//     }
//     await deleteImages(filesToDelete);

//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     handlePgError(err, res);
//   }
// };

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE products SET deleted_at = NOW() WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product soft-deleted successfully" });
  } catch (err) {
    handlePgError(err, res);
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
