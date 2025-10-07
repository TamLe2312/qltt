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

      case "zipcode_not_empty":
        return res
          .status(400)
          .json({ error: "Mã bưu điện không được để trống" });

      default:
        return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }
  }

  if (err.code === "23505") {
    return res.status(400).json({ error: "Dữ liệu đã tồn tại" });
  }

  if (err.code === "23502") {
    return res.status(400).json({ error: `${err.column} không được null` });
  }

  console.error(err);
  return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
}

module.exports = handlePgError;
