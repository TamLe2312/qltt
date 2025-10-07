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

CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    CONSTRAINT name_not_empty CHECK (name <> ''),
    parent_id BIGINT DEFAULT NULL REFERENCES categories(category_id) ON DELETE SET NULL
) INHERITS (meta_time);
