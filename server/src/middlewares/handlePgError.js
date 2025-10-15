const e = require("express");

function handlePgError(err, res) {
  if (err.code === "23514") {
    switch (err.constraint) {
      case "email_format":
        return res.status(400).json({ error: "Email không hợp lệ" });

      case "phone_format":
        return res.status(400).json({ error: "Số điện thoại không hợp lệ" });

      case "name_not_empty":
        return res.status(400).json({ error: "Tên không được để trống" });

      case "street_not_empty":
        return res.status(400).json({ error: "Đường không được để trống" });

      case "ward_not_empty":
        return res.status(400).json({ error: "Phường/Xã không được để trống" });

      case "district_not_empty":
        return res
          .status(400)
          .json({ error: "Quận/Huyện không được để trống" });

      case "city_not_empty":
        return res.status(400).json({ error: "Thành phố không được để trống" });

      case "country_not_empty":
        return res.status(400).json({ error: "Quốc gia không được để trống" });

      case "inventories_quantity_positive":
        return res.status(400).json({ error: "Số lượng phải lớn hơn 0" });

      case "zipcode_not_empty":
        return res
          .status(400)
          .json({ error: "Mã bưu điện không được để trống" });

      default:
        return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }
  }

  if (err.code === "23505") {
    switch (err.constraint) {
      case "users_username_key":
        return res.status(400).json({ error: "Username đã tồn tại" });

      case "unique_email":
        return res.status(400).json({ error: "Email đã tồn tại" });

      default:
        return res.status(400).json({ error: "Dữ liệu đã tồn tại" });
    }
  }

  if (err.code === "23502") {
    return res.status(400).json({ error: `${err.column} không được trống` });
  }
  if (err.code === "22P02") {
    console.log(err);
    return res.status(400).json({
      error: "Một trường dữ liệu số không hợp lệ.",
    });
  }
  if (err.code === "P0001") {
    if (err.message.includes("Người dùng đã có một địa chỉ mặc định")) {
      return res
        .status(400)
        .json({ error: "Người dùng đã có một địa chỉ mặc định." });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
}

module.exports = handlePgError;
