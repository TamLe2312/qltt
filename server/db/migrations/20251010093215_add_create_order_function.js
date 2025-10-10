/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION create_order(
    fn_user_id BIGINT,
	fn_branch_id BIGINT,
    fn_note TEXT,
    fn_products JSONB,
    fn_street TEXT,
    fn_ward TEXT,
    fn_district TEXT,
    fn_city TEXT,
    fn_country TEXT,
    fn_zipcode TEXT
)
RETURNS orders AS $$
DECLARE
    new_order orders;
BEGIN
    INSERT INTO orders (street, ward, district, city, country, zipcode, user_id, branch_id, note)
    VALUES (fn_street, fn_ward, fn_district, fn_city, fn_country, fn_zipcode, fn_user_id, fn_branch_id, fn_note)
    RETURNING * INTO new_order;

    INSERT INTO order_details (
        order_id, product_id, quantity, price
    )
    SELECT
        new_order.id,
        (p->>'product_id')::BIGINT,
        (p->>'quantity')::INT,
        (p->>'price')::NUMERIC
    FROM jsonb_array_elements(fn_products) AS p;

    RETURN new_order;
END;
$$ LANGUAGE plpgsql;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(
    `DROP FUNCTION IF EXISTS create_order(BIGINT, BIGINT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);`
  );
};
