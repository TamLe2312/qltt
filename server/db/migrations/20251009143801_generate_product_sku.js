/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
DECLARE
    sku_prefix TEXT := 'SP';
    padded_id TEXT;
BEGIN
    padded_id := LPAD(NEW.id::TEXT, 6, '0');

    NEW.sku := sku_prefix || '-' || to_char(NEW.created_at, 'YYMMDD') || '-' || padded_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_sku_before_insert
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_sku();
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
        DROP TRIGGER IF EXISTS trg_generate_sku_before_insert ON products;
        DROP FUNCTION IF EXISTS generate_product_sku();
    `);
};
