function handlePgError(err, res) {
  // ✅ CHECK constraint violations
  if (err.code === "23514") {
    let message;
    switch (err.constraint) {
      case "email_format":
        message = "Invalid email format";
        break;
      case "phone_format":
        message = "Invalid phone number format";
        break;
      case "name_not_empty":
        message = "Name cannot be empty";
        break;
      case "street_not_empty":
        message = "Street cannot be empty";
        break;
      case "ward_not_empty":
        message = "Ward cannot be empty";
        break;
      case "district_not_empty":
        message = "District cannot be empty";
        break;
      case "city_not_empty":
        message = "City cannot be empty";
        break;
      case "country_not_empty":
        message = "Country cannot be empty";
        break;
      case "inventories_quantity_positive":
        message = "Quantity must be greater than 0";
        break;
      case "zipcode_not_empty":
        message = "Zip code cannot be empty";
        break;
      default:
        message = "Invalid data provided";
    }
    return res.status(400).json({ status: "error", message });
  }

  // ✅ UNIQUE constraint violations
  if (err.code === "23505") {
    let message;
    switch (err.constraint) {
      case "users_username_key":
        message = "Username already exists";
        break;
      case "unique_email":
        message = "Email already exists";
        break;
      default:
        message = "Duplicate data found";
    }
    return res.status(400).json({ status: "error", message });
  }

  // ✅ NOT NULL constraint violations
  if (err.code === "23502") {
    return res
      .status(400)
      .json({ status: "error", message: `${err.column} cannot be null` });
  }

  // ✅ Invalid data type (invalid_text_representation)
  if (err.code === "22P02") {
    return res.status(400).json({
      status: "error",
      message: "A numeric field has an invalid value.",
    });
  }

  // ✅ RAISE EXCEPTION errors from PostgreSQL functions
  if (err.code === "P0001") {
    if (err.message.includes("Người dùng đã có một địa chỉ mặc định")) {
      return res.status(400).json({
        status: "error",
        message: "The user already has a default address.",
      });
    }
  }

  // ✅ Other unexpected errors
  console.error("PostgreSQL Error:", err);
  return res.status(500).json({
    status: "error",
    message: `Internal server error - ${err.message}`,
  });
}

module.exports = handlePgError;
