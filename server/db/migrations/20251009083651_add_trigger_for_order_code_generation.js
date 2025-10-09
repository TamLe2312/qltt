// file: <timestamp>_add_trigger_for_order_code_generation.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION generate_and_update_order_code()
RETURNS TRIGGER AS $$
DECLARE
    new_order_code TEXT;
BEGIN
    new_order_code := 'ORD' || to_char(NEW.created_at, 'YYMMDD') || LPAD(NEW.id::text, 6, '0');
    
    UPDATE orders
    SET order_code = new_order_code
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_code
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_and_update_order_code();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS set_order_code ON orders;
    DROP FUNCTION IF EXISTS generate_order_code();
  `);
};
