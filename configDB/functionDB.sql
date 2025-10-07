CREATE OR REPLACE FUNCTION get_all_categories_hierarchy()
RETURNS TABLE (
    category_id BIGINT,
    name TEXT,
    parent_id BIGINT,
    path BIGINT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE category_tree AS (
        SELECT 
            c.category_id,
            c.name,
            c.parent_id,
            ARRAY[c.category_id] AS path
        FROM categories c
        WHERE c.parent_id IS NULL

        UNION ALL

        SELECT 
            c.category_id,
            c.name,
            c.parent_id,
            ct.path || c.category_id
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.category_id
        WHERE NOT c.category_id = ANY(ct.path)
    )
    SELECT 
        ct.category_id,
        ct.name,
        ct.parent_id,
        ct.path
    FROM category_tree ct
    ORDER BY ct.path;
END;
$$ LANGUAGE plpgsql;
