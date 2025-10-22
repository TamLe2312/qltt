CREATE OR REPLACE FUNCTION soft_delete_generic()
RETURNS TRIGGER AS $$
DECLARE
    pk_value TEXT;
BEGIN
    -- Lấy giá trị khóa chính từ OLD dưới dạng text
    EXECUTE format('SELECT ($1).%I::text', TG_ARGV[0])
    INTO pk_value
    USING OLD;

    -- Cập nhật deleted_at
    EXECUTE format(
        'UPDATE %I SET deleted_at = NOW() WHERE %I::text = $1',
        TG_TABLE_NAME, TG_ARGV[0]
    ) USING pk_value;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

Hướng dẫn dùng 
CREATE TRIGGER soft_delete_inventories
BEFORE DELETE ON inventories
FOR EACH ROW
EXECUTE FUNCTION soft_delete_generic('id');



-- Hàm tìm kiếm đơn hàng với bộ lọc động và nhóm theo khoảng thời gian
CREATE OR REPLACE FUNCTION get_orders_statistics(
    filters JSONB,
    group_by TEXT
)
RETURNS TABLE(
    period TIMESTAMP,
    total_orders BIGINT,
    total_amount NUMERIC
) AS $$
DECLARE
    sql TEXT;
BEGIN
    sql := 'SELECT DATE_TRUNC(''' || group_by || ''', created_at) as period,
                   COUNT(*) as total_orders,
                   SUM(total_amount) as total_amount
            FROM orders
            WHERE deleted_at IS NULL';

    IF filters ? 'startDate' THEN
        sql := sql || ' AND created_at >= ' || quote_literal(filters->>'startDate');
    END IF;

    IF filters ? 'endDate' THEN
        sql := sql || ' AND created_at <= ' || quote_literal(filters->>'endDate');
    END IF;

    IF filters ? 'status' THEN
        sql := sql || ' AND status = ANY(
            ARRAY(
                SELECT jsonb_array_elements_text(' || quote_literal(filters->>'status') || '::jsonb)::order_status
            )
        )';
    END IF;

    IF filters ? 'branchId' THEN
        sql := sql || ' AND branch_id = ' || (filters->>'branchId');
    END IF;

    IF filters ? 'city' THEN
        sql := sql || ' AND city = ' || quote_literal(filters->>'city');
    END IF;

    IF filters ? 'userId' THEN
        sql := sql || ' AND user_id = ' || (filters->>'userId');
    END IF;

    IF filters ? 'minTotal' THEN
        sql := sql || ' AND total_amount >= ' || (filters->>'minTotal');
    END IF;

    IF filters ? 'maxTotal' THEN
        sql := sql || ' AND total_amount <= ' || (filters->>'maxTotal');
    END IF;

    sql := sql || ' GROUP BY period ORDER BY period';

    RETURN QUERY EXECUTE sql;
END;
$$ LANGUAGE plpgsql;
cho thêm nhiều ví dụ thao tác trực tiếp trong sql với hàm này

CREATE TYPE inventory_status AS ENUM (
  'active',
  'inactive',
  'out_of_stock'
);


-- Tạo hàm trigger
CREATE OR REPLACE FUNCTION inactivate_inventories_when_product_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Kiểm tra: chỉ thực hiện khi deleted_at thay đổi từ NULL → có giá trị
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE inventories
    SET status = 'inactive'
    WHERE product_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger vào bảng products
CREATE TRIGGER trg_product_soft_delete
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION inactivate_inventories_when_product_deleted();
