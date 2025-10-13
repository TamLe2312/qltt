-- Function phân trang tái sử dụng
CREATE OR REPLACE FUNCTION paginate_table(
    p_table_name text,
    p_page_size int,
    p_page_number int,
    p_order_column text,
    p_order_dir text DEFAULT 'ASC'
)
RETURNS TABLE(
    total_count bigint,
    total_pages bigint,
    data jsonb
) AS $$
DECLARE
    v_offset bigint;
    v_sql text;
    v_count bigint;
BEGIN
    -- Tính offset
    v_offset := (p_page_number - 1) * p_page_size;

    -- Lấy tổng số bản ghi
    EXECUTE format('SELECT count(*) FROM %I', p_table_name)
    INTO v_count;

    -- Truy vấn dữ liệu với limit/offset và sắp xếp
    v_sql := format(
        'SELECT jsonb_agg(t) FROM (SELECT * FROM %I ORDER BY %I %s LIMIT %s OFFSET %s) t',
        p_table_name,
        p_order_column,
        CASE WHEN upper(p_order_dir) = 'DESC' THEN 'DESC' ELSE 'ASC' END,
        p_page_size,
        v_offset
    );

    RETURN QUERY
    SELECT 
        v_count AS total_count,
        CEIL(v_count::numeric / p_page_size) AS total_pages,
        (EXECUTE v_sql) AS data;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM paginate_table(
    'users',       -- bảng cần phân trang
    20,            -- page size
    2,             -- page number
    'created_at',  -- cột sắp xếp
    'DESC'         -- chiều sắp xếp
);
