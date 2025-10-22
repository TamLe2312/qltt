--Tạo bảng địa chỉ dùng chung
CREATE TABLE address (
    street   TEXT,
    ward     TEXT,
    district TEXT,
    city     TEXT,
    country  TEXT,
    zipcode  TEXT
);

--Tạo bảng kế thừa chung cho thời gian tạo, cập nhật, xóa
CREATE TABLE meta_time (
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

--Tạo bảng kế thừa chung cho thông tin người tạo, người cập nhật, người xóa
CREATE TABLE meta_user (
    created_by BIGINT,
    updated_by BIGINT,
    deleted_by BIGINT
);

--Tạo bảng kế thừa chung cho địa chỉ và thông tin liên hệ
CREATE TABLE contact_info (
    email TEXT,
    phone TEXT
);

-- Tạo audit_log để ghi lại các thay đổi trong các bảng khác
CREATE TABLE audit_log (
    audit_log_id BIGSERIAL PRIMARY KEY,
    table_name TEXT,
    record_id BIGINT,
    action TEXT,
    old_data JSON,
    new_data JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP
);

--Tạo kiểu ENUM cho trạng thái người dùng
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');

--Tạo chi nhánh
CREATE TABLE branches (
    branch_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    CONSTRAINT name_not_empty CHECK (name <> ''),
    CONSTRAINT email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT phone_format CHECK (
        phone ~ '^0[0-9]{9,10}$'
    )
) INHERITS (address, contact_info, meta_time);

--Tạo nhà cung cấp
CREATE TABLE suppliers (
    supplier_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    CONSTRAINT name_not_empty CHECK (name <> ''),
    CONSTRAINT email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT phone_format CHECK (
        phone ~ '^0[0-9]{9,10}$'
    )
) INHERITS (address, contact_info, meta_time);

--Tạo danh mục
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    CONSTRAINT name_not_empty CHECK (name <> ''),
    parent_id BIGINT DEFAULT NULL REFERENCES categories(category_id) ON DELETE SET NULL
) INHERITS (meta_time);

--Tạo kho
CREATE TABLE inventories (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT REFERENCES branches(supplier_id),
    product_id BIGINT REFERENCES products(id),
    quantity INT,
    CONSTRAINT inventories_quantity_positive CHECK (quantity >= 0),
    reserved_quantity INT DEFAULT 0,
    CONSTRAINT inventories_reserved_quantity_positive CHECK (reserved_quantity >= 0),
) INHERITS (meta_time);