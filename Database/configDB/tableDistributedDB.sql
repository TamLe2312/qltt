/*
=================================================
PHẦN 1: BẢNG TOÀN CỤC (GLOBAL TABLES)
=================================================
 */
CREATE TABLE
    categories (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_categories_name_not_empty CHECK (LEN (name) > 0),
        parent_id INT DEFAULT NULL,
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_categories_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_categories_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_PARENT_ID_CATEGORIES FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE NO ACTION
    );

GO
CREATE TABLE
    products (
        id INT PRIMARY KEY IDENTITY (1, 1),
        sku VARCHAR(100) UNIQUE NOT NULL,
        CONSTRAINT CK_products_sku_not_empty CHECK (LEN (sku) > 0),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_products_name_not_empty CHECK (LEN (name) > 0),
        category_id INT,
        price DECIMAL(18, 2) NOT NULL DEFAULT 0,
        avatar NVARCHAR (MAX),
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        CONSTRAINT CK_products_status CHECK (
            status IN (
                'Active',
                'Inactive',
                'OutOfStock',
                'Discontinued'
            )
        ),
        unit_of_measure NVARCHAR (50) NOT NULL,
        CONSTRAINT CK_products_unit_of_measure_not_empty CHECK (LEN (unit_of_measure) > 0),
        short_description NVARCHAR (500),
        description NVARCHAR (MAX),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_products_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_products_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_Categories_Product FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    );

GO
CREATE TABLE
    ProductImages (
        id INT PRIMARY KEY IDENTITY (1, 1),
        product_id INT NOT NULL,
        imageURL NVARCHAR (MAX) NOT NULL,
        sortOrder INT DEFAULT 0,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_ProductImages_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_ProductImages_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_ProductImages_Product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

GO
CREATE TABLE
    users (
        id INT PRIMARY KEY IDENTITY (1, 1),
        full_name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_users_full_name_not_empty CHECK (LEN (full_name) > 0),
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        CONSTRAINT CK_users_status CHECK (status IN ('Active', 'Inactive', 'Blocked')),
        username VARCHAR(255) UNIQUE NOT NULL,
        CONSTRAINT CK_users_username_not_empty CHECK (LEN (username) > 0),
        password VARCHAR(MAX) NOT NULL,
        CONSTRAINT CK_users_password_not_empty CHECK (LEN (password) > 0),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        CONSTRAINT CK_users_phone_format CHECK (
            phone LIKE '0%'
            AND LEN (phone) IN (10, 11)
            AND phone NOT LIKE '%[^0-9]%'
        ),
        CONSTRAINT CK_users_email_basic_format CHECK (email LIKE '%_@__%.__%'),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_users_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_users_rowguid UNIQUE (rowguid)
    );

GO
CREATE TABLE
    suppliers (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_name_not_empty CHECK (LEN (name) > 0),
        street NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_street_not_empty CHECK (LEN (street) > 0),
        ward NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_ward_not_empty CHECK (LEN (ward) > 0),
        district NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_district_not_empty CHECK (LEN (district) > 0),
        city NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_city_not_empty CHECK (LEN (city) > 0),
        country NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_country_not_empty CHECK (LEN (country) > 0),
        zipcode NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_suppliers_zipcode_not_empty CHECK (LEN (zipcode) > 0),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        CONSTRAINT CK_suppliers_phone_format CHECK (
            phone LIKE '0%'
            AND LEN (phone) IN (10, 11)
            AND phone NOT LIKE '%[^0-9]%'
        ),
        CONSTRAINT CK_suppliers_email_basic_format CHECK (email LIKE '%_@__%.__%'),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_suppliers_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_suppliers_rowguid UNIQUE (rowguid)
    );

GO
CREATE TABLE
    branches (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_name_not_empty CHECK (LEN (name) > 0),
        street NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_street_not_empty CHECK (LEN (street) > 0),
        ward NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_ward_not_empty CHECK (LEN (ward) > 0),
        district NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_district_not_empty CHECK (LEN (district) > 0),
        city NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_city_not_empty CHECK (LEN (city) > 0),
        country NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_country_not_empty CHECK (LEN (country) > 0),
        zipcode NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_branches_zipcode_not_empty CHECK (LEN (zipcode) > 0),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        CONSTRAINT CK_branches_phone_format CHECK (
            phone LIKE '0%'
            AND LEN (phone) IN (10, 11)
            AND phone NOT LIKE '%[^0-9]%'
        ),
        CONSTRAINT CK_branches_email_basic_format CHECK (email LIKE '%_@__%.__%'),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_branches_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_branches_rowguid UNIQUE (rowguid)
    );

GO
CREATE TABLE
    roles (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_roles_name_not_empty CHECK (LEN (name) > 0),
        description NVARCHAR (MAX) NOT NULL,
        CONSTRAINT CK_roles_description_not_empty CHECK (LEN (description) > 0),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_roles_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_roles_rowguid UNIQUE (rowguid)
    );

GO
CREATE TABLE
    permissions (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_permissions_name_not_empty CHECK (LEN (name) > 0),
        description NVARCHAR (MAX) NOT NULL,
        CONSTRAINT CK_permissions_description_not_empty CHECK (LEN (description) > 0),
        permission_key NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_permissions_permission_key_not_empty CHECK (LEN (permission_key) > 0),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_permissions_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_permissions_rowguid UNIQUE (rowguid)
    );

GO
CREATE TABLE
    customer_address (
        id INT PRIMARY KEY IDENTITY (1, 1),
        user_id INT NOT NULL,
        is_default BIT DEFAULT 1,
        street NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_street_not_empty CHECK (LEN (street) > 0),
        ward NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_ward_not_empty CHECK (LEN (ward) > 0),
        district NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_district_not_empty CHECK (LEN (district) > 0),
        city NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_city_not_empty CHECK (LEN (city) > 0),
        country NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_country_not_empty CHECK (LEN (country) > 0),
        zipcode NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_customer_address_zipcode_not_empty CHECK (LEN (zipcode) > 0),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_customer_address_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_customer_address_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_User_Id_Users_Address FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

GO
CREATE TABLE
    role_permission (
        role_id INT,
        permission_id INT,
        PRIMARY KEY (role_id, permission_id),
        -- THÊM CỘT ROWGUID BẮT BUỘC
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_role_permission_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_role_permission_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_Role_Id_Roles_Perm FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        CONSTRAINT FK_Permission_Id_Perm FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
    );

GO
CREATE TABLE
    user_roles (
        user_id INT,
        role_id INT,
        PRIMARY KEY (user_id, role_id),
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_user_roles_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_user_roles_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_User_Id_Users_Roles FOREIGN KEY (user_id) -- Đổi tên FK
        REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT FK_Role_Id_Roles_Users FOREIGN KEY (role_id) -- Đổi tên FK
        REFERENCES roles (id) ON DELETE CASCADE
    );

GO
CREATE TABLE
    order_status_transitions (
        from_status VARCHAR(30) NOT NULL,
        CONSTRAINT CK_orders_status CHECK (
            from_status IN (
                'Pending',
                'Confirmed',
                'Processing',
                'Shipped',
                'Delivered',
                'Canceled',
                'Failed',
                'Refunded',
                'Completed'
            )
        ),
        to_status VARCHAR(30) NOT NULL,
        CONSTRAINT CK_orders_status CHECK (
            to_status IN (
                'Pending',
                'Confirmed',
                'Processing',
                'Shipped',
                'Delivered',
                'Canceled',
                'Failed',
                'Refunded',
                'Completed'
            )
        ),
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_user_roles_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_user_roles_rowguid UNIQUE (rowguid),
        PRIMARY KEY (from_status, to_status)
    );

GO
/*
=================================================
PHẦN 2: BẢNG CỤC BỘ (LOCAL TABLES)
=================================================
 */
CREATE TABLE
    orders_core (
        id INT PRIMARY KEY IDENTITY (1, 1),
        order_code VARCHAR(100) UNIQUE,
        user_id INT,
        branch_id INT,
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_orders_core_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_orders_core_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_Order_User_Id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT FK_Order_Branch_Id FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE SET NULL
    );

GO
CREATE TABLE
    orders_extra (
        order_id INT,
        branch_id INT,
        status VARCHAR(30) NOT NULL DEFAULT 'Pending',
        CONSTRAINT CK_orders_status CHECK (
            status IN (
                'Pending',
                'Confirmed',
                'Processing',
                'Shipped',
                'Delivered',
                'Canceled',
                'Failed',
                'Refunded',
                'Completed'
            )
        ),
        note NVARCHAR (MAX),
        total_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        street NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_street_not_empty CHECK (LEN (street) > 0),
        ward NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_ward_not_empty CHECK (LEN (ward) > 0),
        district NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_district_not_empty CHECK (LEN (district) > 0),
        city NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_city_not_empty CHECK (LEN (city) > 0),
        country NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_country_not_empty CHECK (LEN (country) > 0),
        zipcode NVARCHAR (255) NOT NULL,
        CONSTRAINT CK_orders_extra_zipcode_not_empty CHECK (LEN (zipcode) > 0),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_orders_extra_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_orders_extra_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_Order_Id_Orders_Core FOREIGN KEY (order_id) REFERENCES orders_core (id) ON DELETE CASCADE,
        CONSTRAINT FK_Order_Extra_Branch_Id FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE NO ACTION
    );

GO
CREATE TABLE
    inventories (
        id INT PRIMARY KEY IDENTITY (1, 1),
        supplier_id INT NOT NULL,
        branch_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        CONSTRAINT CK_inventories_quantity_positive CHECK (quantity >= 0),
        reserved_stock INT DEFAULT 0,
        CONSTRAINT CK_inventories_reserved_stock_positive CHECK (reserved_stock >= 0),
        created_at DATETIME2 DEFAULT SYSDATETIME (),
        updated_at DATETIME2,
        rowguid uniqueidentifier NOT NULL CONSTRAINT DF_inventories_rowguid DEFAULT (NEWSEQUENTIALID ()) ROWGUIDCOL,
        CONSTRAINT UQ_inventories_rowguid UNIQUE (rowguid),
        CONSTRAINT FK_Inv_Branch_Id FOREIGN KEY (branch_id) REFERENCES branches (id),
        CONSTRAINT FK_Inv_Supplier_Id FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
        CONSTRAINT FK_Inv_Product_Id FOREIGN KEY (product_id) REFERENCES products (id)
    );