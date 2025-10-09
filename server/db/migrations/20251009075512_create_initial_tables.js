/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TABLE address (
        street   TEXT NOT NULL,
        CONSTRAINT street_not_empty CHECK (street <> ''),
        ward     TEXT NOT NULL,
        CONSTRAINT ward_not_empty CHECK (ward <> ''),
        district TEXT NOT NULL,
        CONSTRAINT district_not_empty CHECK (district <> ''),
        city     TEXT NOT NULL,
        CONSTRAINT city_not_empty CHECK (city <> ''),
        country  TEXT NOT NULL,
        CONSTRAINT country_not_empty CHECK (country <> ''),
        zipcode  TEXT NOT NULL,
        CONSTRAINT zipcode_not_empty CHECK (zipcode <> '')
    );

    CREATE TABLE meta_time (
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        deleted_at TIMESTAMP
    );

    CREATE TABLE meta_user (
        created_by BIGINT,
        updated_by BIGINT,
        deleted_by BIGINT
    );

    CREATE TABLE contact_info (
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        CONSTRAINT email_format CHECK (
            email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        ),
        CONSTRAINT phone_format CHECK (
            phone ~ '^0[0-9]{9,10}$'
        )
    );

    CREATE TABLE audit_log (
        id BIGSERIAL PRIMARY KEY,
        table_name TEXT,
        record_id BIGINT,
        action TEXT,
        old_data JSON,
        new_data JSON,
        changed_by BIGINT,
        changed_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');

    CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        CONSTRAINT full_name_not_empty CHECK (full_name <> ''),
        status user_status NOT NULL,
        username TEXT UNIQUE NOT NULL,
        CONSTRAINT username_not_empty CHECK (username <> ''),
        password TEXT NOT NULL,
        CONSTRAINT password_not_empty CHECK (password <> '')
    ) INHERITS (contact_info, meta_time);

    CREATE TABLE branches (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        CONSTRAINT name_not_empty CHECK (name <> '')
    ) INHERITS (address, contact_info, meta_time);

    CREATE TABLE customer_address (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) NOT NULL
    ) INHERITS (address, meta_time);

    CREATE TABLE categories (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        CONSTRAINT name_not_empty CHECK (name <> ''),
        parent_id BIGINT DEFAULT NULL REFERENCES categories(id) ON DELETE SET NULL
    ) INHERITS (meta_time);

    CREATE TABLE products (
        id BIGSERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        CONSTRAINT sku_not_empty CHECK (sku <> ''),
        name TEXT NOT NULL,
        CONSTRAINT name_not_empty CHECK (name <> ''),
        category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
        price NUMERIC(14,2) NOT NULL,
        avatar TEXT NOT NULL,
        CONSTRAINT avatar_not_empty CHECK (avatar <> ''),
        status TEXT NOT NULL,
        CONSTRAINT status_not_empty CHECK (status <> ''),
        images TEXT[],
        unit_of_measure TEXT NOT NULL,
        CONSTRAINT unit_of_measure_not_empty CHECK (unit_of_measure <> ''),
        short_description TEXT,
        description TEXT NOT NULL,
        CONSTRAINT description_not_empty CHECK (description <> '')
    ) INHERITS (meta_time);

    CREATE TABLE orders (
        id BIGSERIAL PRIMARY KEY,
        order_code TEXT UNIQUE,
        customer_address_id BIGINT REFERENCES customer_address(id) NOT NULL,
        user_id BIGINT REFERENCES users(id) NOT NULL,
        branch_id BIGINT REFERENCES branches(id) NOT NULL,
        status TEXT DEFAULT 'pending', -- SỬA LỖI Ở ĐÂY
        note TEXT,
        total_amount NUMERIC(14,2)
    ) INHERITS (meta_time);

    CREATE TABLE order_details (
        id BIGSERIAL PRIMARY KEY,
        order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
        quantity INT NOT NULL,
        CONSTRAINT order_details_quantity_positive CHECK (quantity >= 0),
        price NUMERIC(14,2) NOT NULL
    );

    CREATE TABLE suppliers (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        CONSTRAINT name_not_empty CHECK (name <> '')
    ) INHERITS (address, contact_info, meta_time);

    CREATE TABLE inventories (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id) NOT NULL,
        product_id BIGINT REFERENCES products(id) NOT NULL,
        quantity INT NOT NULL,
        CONSTRAINT inventories_quantity_positive CHECK (quantity >= 0),
        reserved_quantity INT DEFAULT 0,
        CONSTRAINT inventories_reserved_quantity_positive CHECK (reserved_quantity >= 0) -- SỬA LỖI Ở ĐÂY
    ) INHERITS (meta_time);

    CREATE TABLE roles (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        description TEXT
    ) INHERITS (meta_time);

    CREATE TABLE permissions (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        permission_key TEXT,
        description TEXT
    ) INHERITS (meta_time);

    CREATE TABLE role_permissions (
        role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
        permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE user_roles (
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE refresh_tokens (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    -- Xóa các bảng theo thứ tự ngược lại để tránh lỗi khóa ngoại
    -- Xóa các bảng nối trước
    DROP TABLE IF EXISTS user_roles;
    DROP TABLE IF EXISTS role_permissions;
    DROP TABLE IF EXISTS order_details;
    
    -- Xóa các bảng chính
    DROP TABLE IF EXISTS refresh_tokens;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS roles;
    DROP TABLE IF EXISTS inventories;
    DROP TABLE IF EXISTS suppliers;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS customer_address;
    DROP TABLE IF EXISTS branches;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS audit_log;
    
    -- Xóa các bảng "template"
    DROP TABLE IF EXISTS contact_info;
    DROP TABLE IF EXISTS meta_user;
    DROP TABLE IF EXISTS meta_time;
    DROP TABLE IF EXISTS address;

    -- Cuối cùng, xóa kiểu dữ liệu ENUM đã tạo
    DROP TYPE IF EXISTS user_status;
  `);
};
