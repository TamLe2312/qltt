const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");
const { deleteImages } = require("../middlewares/multerConfig.js");

// ============================================================
// Lấy danh sách sản phẩm có phân trang, tìm kiếm, lọc, sắp xếp
// ============================================================
const getAllProducts = async (req, res) => {
  try {
    // ============================================================
    // 1. Nhận & chuẩn hóa tham số từ query string
    // ============================================================
    let {
      page = 1,
      page_size: limit = 20,
      sort_field: sortField = 'created_at',
      sort_order: sortOrder = 'desc',
      search = '',
      category_id,
    } = req.query;

    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    // ============================================================
    // 2. Xác định cột sắp xếp hợp lệ
    // ============================================================
    const allowedSortFields = [
      'id',
      'name',
      'sku',
      'price',
      'created_at',
      'updated_at',
      'category_name',
    ];

    let sortColumn;
    if (sortField === 'category_name') sortColumn = 'categories.name';
    else if (allowedSortFields.includes(sortField))
      sortColumn = `products.${sortField}`;
    else sortColumn = 'products.created_at';

    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // ============================================================
    // 3. Tạo bộ lọc WHERE động
    // ============================================================
    const filters = [`products.deleted_at IS NULL`];
    const params = [];
    let paramIndex = 1;

    // -- Tìm kiếm (theo tên, mã SKU, tên danh mục)
    if (search) {
      filters.push(`
        (
          unaccent(products.name) ILIKE unaccent($${paramIndex})
          OR unaccent(products.sku) ILIKE unaccent($${paramIndex})
          OR unaccent(categories.name) ILIKE unaccent($${paramIndex})
        )
      `);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // -- Lọc theo danh mục
    if (category_id) {
      filters.push(`products.category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // ============================================================
    // 4. Truy vấn dữ liệu chính (danh sách sản phẩm)
    // ============================================================
    const query = `
      SELECT products.*, categories.name AS category_name
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, [...params, limit, offset]);

    // ============================================================
    // 5. Truy vấn tổng số bản ghi (phục vụ phân trang)
    // ============================================================
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, params);

    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // ============================================================
    // 6. Trả kết quả về client
    // ============================================================
    res.json({
      data: {
        items: result.rows,
        pagination: { total, page, perPage: limit, totalPages },
        sort: { field: sortField, order: sortOrder },
      },
      status: 'success',
      message: 'Fetched successfully',
    });
  } catch (err) {
    // ============================================================
    // 7. Xử lý lỗi
    // ============================================================
    console.error('Error fetching products:', err);
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
