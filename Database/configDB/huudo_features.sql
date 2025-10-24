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


CREATE OR REPLACE FUNCTION handle_soft_delete_product()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE inventories
    SET status = 'inactive'
    WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_soft_delete_product
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION handle_soft_delete_product();

CREATE TABLE order_status_transitions (
    from_status order_status NOT NULL,
    to_status order_status NOT NULL,
    PRIMARY KEY (from_status, to_status)
);
INSERT INTO order_status_transitions (from_status, to_status) VALUES
-- flow chuẩn
('pending', 'confirmed'),
('confirmed', 'processing'),
('processing', 'shipped'),
('shipped', 'delivered'),

-- flow hủy/ thất bại
('pending', 'canceled'),
('confirmed', 'canceled'),
('processing', 'canceled'),
('shipped', 'canceled'),
('pending', 'failed'),
('processing', 'failed'),

-- hoàn tiền / refunded
('delivered', 'refunded'),
('canceled', 'refunded'),
('completed', 'refunded'),

-- hoàn tất
('delivered', 'completed');
CREATE OR REPLACE FUNCTION change_order_status(p_order_id INT, p_new_status order_status)
RETURNS VOID AS $$
DECLARE
    v_current_status order_status;
BEGIN
    -- Lấy trạng thái hiện tại
    SELECT status INTO v_current_status FROM orders WHERE id = p_order_id;

    IF NOT EXISTS (
        SELECT 1 
        FROM order_status_transitions
        WHERE from_status = v_current_status AND to_status = p_new_status
    ) THEN
        RAISE EXCEPTION 'Cannot change status from % to %', v_current_status, p_new_status;
    END IF;

    -- Cập nhật trạng thái
    UPDATE orders SET status = p_new_status, updated_at = NOW() WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;
-- Thử chuyển trạng thái
SELECT change_order_status(50, 'processing'); -- chỉ hợp lệ nếu từ confirmed
