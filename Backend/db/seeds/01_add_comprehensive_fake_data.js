// file: seeds/01_add_comprehensive_data.js

const { faker } = require("@faker-js/faker/locale/vi");
const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // --- DỌN DẸP DỮ LIỆU CŨ THEO THỨ TỰ NGƯỢC CỦA KHÓA NGOẠI ---
  console.log("Cleaning old data...");
  await knex("user_roles").del();
  await knex("role_permissions").del(); // Giả sử có bảng này
  await knex("order_details").del();
  await knex("refresh_tokens").del();
  await knex("inventories").del();
  await knex("orders").del();
  await knex("products").del();
  await knex("categories").del();
  await knex("customer_address").del();
  await knex("suppliers").del();
  await knex("branches").del();
  await knex("users").del();
  await knex("roles").del();
  await knex("permissions").del(); // Giả sử có bảng này
  console.log("Cleared old data.");

  // --- TẠO DỮ LIỆU MỚI ---
  console.log("Starting to seed new data...");

  // 1. Tạo Roles
  const roles = await knex("roles")
    .insert([
      { name: "Admin", description: "Quản trị viên hệ thống" },
      { name: "Staff", description: "Nhân viên chi nhánh" },
      { name: "Customer", description: "Khách hàng" },
    ])
    .returning("*");
  console.log(`-> Created ${roles.length} roles.`);

  // 2. Tạo Users
  const usersToInsert = [];
  const hashedPassword = await bcrypt.hash("password123", 10);
  let phoneCounter = 987654321; // Dùng để tạo SĐT không trùng lặp

  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    usersToInsert.push({
      full_name: `${lastName} ${firstName}`,
      status: "active",
      username: faker.internet.username().toLowerCase(),
      password: hashedPassword,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `0${phoneCounter++}`,
      created_at: faker.date.past({ years: 1 }),
    });
  }
  const users = await knex("users").insert(usersToInsert).returning("*");
  console.log(`-> Created ${users.length} users.`);

  // 3. Gán Role cho User
  const adminRole = roles.find((r) => r.name === "Admin");
  const staffRole = roles.find((r) => r.name === "Staff");
  const customerRole = roles.find((r) => r.name === "Customer");

  const userRolesToInsert = users.map((user, index) => {
    let role_id;
    if (index === 0) role_id = adminRole.id; // User đầu tiên là Admin
    else if (index > 0 && index < 3)
      role_id = staffRole.id; // 2 user tiếp theo là Staff
    else role_id = customerRole.id; // Còn lại là Customer
    return { user_id: user.id, role_id };
  });
  await knex("user_roles").insert(userRolesToInsert);
  console.log(`-> Assigned roles to ${users.length} users.`);

  // 4. Tạo Branches (Chi nhánh)
  const branchesToInsert = [];
  for (let i = 0; i < 3; i++) {
    branchesToInsert.push({
      name: `Chi nhánh ${faker.location.city()}`,
      street: faker.location.streetAddress(false),
      ward: faker.location.county(),
      district: faker.location.city(),
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      zipcode: faker.location.zipCode("70####"),
      email: faker.internet.email(),
      phone: `0${phoneCounter++}`,
    });
  }
  const branches = await knex("branches")
    .insert(branchesToInsert)
    .returning("*");
  console.log(`-> Created ${branches.length} branches.`);

  // 5. Tạo Suppliers (Nhà cung cấp)
  const suppliersToInsert = [];
  for (let i = 0; i < 5; i++) {
    suppliersToInsert.push({
      name: faker.company.name(),
      street: faker.location.streetAddress(false),
      ward: faker.location.county(),
      district: faker.location.city(),
      city: "Hà Nội",
      country: "Việt Nam",
      zipcode: faker.location.zipCode("10####"),
      email: faker.internet.email(),
      phone: `0${phoneCounter++}`,
    });
  }
  const suppliers = await knex("suppliers")
    .insert(suppliersToInsert)
    .returning("*");
  console.log(`-> Created ${suppliers.length} suppliers.`);

  // 6. Tạo Categories (có cha-con)
  const parentCategories = await knex("categories")
    .insert([
      { name: "Thực phẩm tươi sống" },
      { name: "Đồ uống" },
      { name: "Hàng gia dụng" },
    ])
    .returning("*");

  const childCategories = await knex("categories")
    .insert([
      { name: "Rau củ", parent_id: parentCategories[0].id },
      { name: "Trái cây", parent_id: parentCategories[0].id },
      { name: "Thịt, cá, trứng", parent_id: parentCategories[0].id },
      { name: "Nước ngọt", parent_id: parentCategories[1].id },
      { name: "Bia & Rượu", parent_id: parentCategories[1].id },
    ])
    .returning("*");
  const allCategories = [...parentCategories, ...childCategories];
  console.log(`-> Created ${allCategories.length} categories.`);

  // 7. Tạo Products
  const productsToInsert = [];
  for (let i = 0; i < 50; i++) {
    productsToInsert.push({
      sku: `SKU${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.commerce.productName(),
      category_id: faker.helpers.arrayElement(allCategories).id,
      price: faker.commerce.price({ min: 10000, max: 500000, dec: 0 }),
      avatar: faker.image.urlLoremFlickr({ category: "food" }),
      status: faker.helpers.arrayElement(["available", "out_of_stock"]), // Dùng đúng giá trị ENUM
      unit_of_measure: faker.helpers.arrayElement(["kg", "hộp", "chai", "cái"]),
      description: faker.commerce.productDescription(),
      short_description: faker.lorem.sentence(),
    });
  }
  const products = await knex("products")
    .insert(productsToInsert)
    .returning("*");
  console.log(`-> Created ${products.length} products.`);

  // 8. Tạo Inventories (Kho hàng)
  const inventoriesToInsert = products.map((p) => ({
    product_id: p.id,
    supplier_id: faker.helpers.arrayElement(suppliers).id,
    branch_id: faker.helpers.arrayElement(branches).id,
    quantity: faker.number.int({ min: 50, max: 200 }),
  }));
  await knex("inventories").insert(inventoriesToInsert);
  console.log(`-> Created ${inventoriesToInsert.length} inventory records.`);

  // 9. Tạo Customer Addresses
  const customerUsers = await knex("users as u")
    .join("user_roles as ur", "u.id", "ur.user_id")
    .join("roles as r", "ur.role_id", "r.id")
    .where("r.name", "Customer")
    .select("u.id");

  const addressesToInsert = customerUsers.map((u) => ({
    user_id: u.id,
    street: faker.location.streetAddress(false),
    ward: faker.location.county(),
    district: faker.location.city(),
    city: "Hồ Chí Minh",
    country: "Việt Nam",
    zipcode: "700000",
    is_default: true, // Mỗi user có 1 địa chỉ mặc định
  }));
  const customerAddresses = await knex("customer_address")
    .insert(addressesToInsert)
    .returning("*");
  console.log(`-> Created ${customerAddresses.length} customer addresses.`);

  // 10. Tạo Orders và Order Details
  let createdOrdersCount = 0;
  for (let i = 0; i < 25; i++) {
    const randomUser = faker.helpers.arrayElement(customerUsers);
    const userAddress = customerAddresses.find(
      (a) => a.user_id === randomUser.id
    );
    if (!userAddress) continue; // Bỏ qua nếu user không có địa chỉ

    // Do 'orders' INHERITS 'address', ta phải sao chép dữ liệu địa chỉ vào đơn hàng
    const orderData = {
      user_id: randomUser.id,
      branch_id: faker.helpers.arrayElement(branches).id,
      status: faker.helpers.arrayElement([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]),
      note: faker.lorem.sentence(),
      total_amount: 0, // Sẽ cập nhật sau
      created_at: faker.date.past({ years: 1 }),
      // Sao chép các trường địa chỉ
      street: userAddress.street,
      ward: userAddress.ward,
      district: userAddress.district,
      city: userAddress.city,
      country: userAddress.country,
      zipcode: userAddress.zipcode,
    };

    const [order] = await knex("orders").insert(orderData).returning("id");

    const numItems = faker.number.int({ min: 1, max: 5 });
    let totalAmount = 0;
    const orderDetailsToInsert = [];
    const selectedProducts = faker.helpers.arrayElements(products, numItems);

    for (const product of selectedProducts) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      totalAmount += product.price * quantity;
      orderDetailsToInsert.push({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price, // Lưu lại giá tại thời điểm mua
      });
    }

    if (orderDetailsToInsert.length > 0) {
      await knex("order_details").insert(orderDetailsToInsert);
      await knex("orders")
        .where("id", order.id)
        .update({ total_amount: totalAmount });
      createdOrdersCount++;
    }
  }
  console.log(`-> Created ${createdOrdersCount} orders with details.`);
  console.log("\nSeeding complete!");
};
