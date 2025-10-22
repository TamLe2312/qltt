/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`CREATE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
    t_total_amount NUMERIC(14,2);
BEGIN
    SELECT COALESCE(SUM(od.quantity * od.price), 0)
    INTO t_total_amount
    FROM order_details od
    WHERE od.order_id = COALESCE(NEW.order_id, OLD.order_id);

    UPDATE orders
    SET total_amount = t_total_amount
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_details
FOR EACH ROW
EXECUTE FUNCTION update_order_total();
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_order_total ON order_details;
    DROP FUNCTION IF EXISTS update_order_total();`);
};
