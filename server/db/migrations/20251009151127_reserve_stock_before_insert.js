/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`CREATE OR REPLACE FUNCTION reserve_stock_before_insert()
RETURNS TRIGGER AS $$
DECLARE
    available INT;
BEGIN
    SELECT quantity - reserved_stock INTO available
    FROM inventories
    WHERE product_id = NEW.product_id;

    IF available < NEW.quantity THEN
        RAISE EXCEPTION 'Not enough available stock for product %, required %, available %',
            NEW.product_id, NEW.quantity, available;
    END IF;

    UPDATE inventories
    SET reserved_stock = reserved_stock + NEW.quantity
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reserve_stock
BEFORE INSERT ON order_details
FOR EACH ROW
EXECUTE FUNCTION reserve_stock_before_insert();
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS trigger_reserve_stock ON order_details;
    DROP FUNCTION IF EXISTS reserve_stock_before_insert();
    `);
};
