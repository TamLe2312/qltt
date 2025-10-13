/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION check_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    IF EXISTS (
      SELECT 1
      FROM customer_address
      WHERE
        user_id = NEW.user_id AND
        is_default = true AND
        id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Người dùng đã có một địa chỉ mặc định.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_default_address
BEFORE INSERT OR UPDATE ON customer_address
FOR EACH ROW
EXECUTE FUNCTION check_single_default_address();
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
        DROP TRIGGER IF EXISTS enforce_single_default_address ON customer_address;
        DROP FUNCTION IF EXISTS check_single_default_address();
    `);
};
