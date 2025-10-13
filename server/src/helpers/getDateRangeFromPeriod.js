function getDateRangeFromPeriod(period) {
  const now = new Date();
  let startDate;
  const endDate = new Date(); // Mặc định là cuối ngày hôm nay

  // Set endDate to the end of the current day
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case "week":
      // Bắt đầu từ ngày đầu tuần (Chủ Nhật hoặc Thứ Hai tùy logic)
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      break;
    case "month":
      // Bắt đầu từ ngày đầu tháng
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      // Bắt đầu từ ngày đầu quý
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case "year":
      // Bắt đầu từ ngày đầu năm
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      // Mặc định, nếu không có period, có thể lấy 30 ngày gần nhất
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
  }

  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

module.exports = { getDateRangeFromPeriod };
