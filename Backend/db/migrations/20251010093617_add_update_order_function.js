/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_order(
    fn_order_id BIGINT,
    fn_status order_status,
    fn_note TEXT,
    fn_street TEXT,
    fn_ward TEXT,
    fn_district TEXT,
    fn_city TEXT,
    fn_country TEXT,
    fn_zipcode TEXT
)
RETURNS orders AS $$
DECLARE
    updated_order orders;
BEGIN
    UPDATE orders
    SET note = fn_note,
        status = fn_status,
		street = fn_street,
		ward = fn_ward,
		district = fn_district,
		city = fn_city,
		country = fn_country,
		zipcode = fn_zipcode,
        updated_at = NOW()
    WHERE id = fn_order_id
    RETURNING * INTO updated_order;

    RETURN updated_order;
END;
$$ LANGUAGE plpgsql;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP FUNCTION IF EXISTS update_order;
    `);
};
