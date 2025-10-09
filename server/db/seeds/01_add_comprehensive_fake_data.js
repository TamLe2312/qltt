// file: seeds/05_add_comprehensive_fake_data.js

const { faker } = require("@faker-js/faker/locale/vi");
const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // --- DỌN DẸP DỮ LIỆU CŨ THEO THỨ TỰ NGƯỢC ---
  await knex("order_details").del();
  await knex("orders").del();
  await knex("inventories").del();
  await knex("customer_address").del();
  await knex("user_roles").del();
  await knex("products").del();
  await knex("categories").del();
  await knex("suppliers").del();
  await knex("branches").del();
  await knex("users").del();
  await knex("roles").del();

  console.log("Cleared old data...");

  // --- TẠO DỮ LIỆU MỚI ---

  // 1. Tạo Roles
  const roles = await knex("roles")
    .insert([
      { name: "Admin", description: "Quản trị viên" },
      { name: "Staff", description: "Nhân viên" },
      { name: "Customer", description: "Khách hàng" },
    ])
    .returning("*");
  console.log(`Created ${roles.length} roles...`);

  // 2. Tạo Users
  const usersToInsert = [];
  const saltRounds = 10;
  const plainPassword = "password123";
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // Tạo một số điện thoại cố định để đảm bảo nó luôn hợp lệ
  let userPhoneCounter = 987654321;

  for (let i = 0; i < 10; i++) {
    usersToInsert.push({
      full_name: faker.person.fullName(),
      status: "active",
      username: faker.internet.username().toLowerCase(),
      password: hashedPassword,
      email: faker.internet.email(),
      // SỬA LỖI: Dùng số điện thoại cố định, tăng dần để không bị trùng
      phone: `0${userPhoneCounter++}`,
    });
  }
  const users = await knex("users").insert(usersToInsert).returning("*");
  console.log(`Created ${users.length} users...`);

  // 3. Gán Role cho User
  const userRolesToInsert = users.map((user, index) => ({
    user_id: user.id,
    role_id: index === 0 ? roles[0].id : roles[2].id,
  }));
  await knex("user_roles").insert(userRolesToInsert);
  console.log(`Assigned roles to ${users.length} users...`);

  // 4. Tạo Branches
  const branchesToInsert = [];
  for (let i = 0; i < 3; i++) {
    branchesToInsert.push({
      name: `Chi nhánh ${faker.location.city()}`,
      street: faker.location.streetAddress(),
      ward: faker.location.state(),
      district: faker.location.city(),
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      zipcode: faker.location.zipCode(),
      email: faker.internet.email(),
      // SỬA LỖI: Dùng số điện thoại cố định
      phone: `0${userPhoneCounter++}`,
    });
  }
  const branches = await knex("branches")
    .insert(branchesToInsert)
    .returning("*");
  console.log(`Created ${branches.length} branches...`);

  // 5. Tạo Suppliers
  const suppliersToInsert = [];
  for (let i = 0; i < 5; i++) {
    suppliersToInsert.push({
      name: `NCC ${faker.company.name()}`,
      street: faker.location.streetAddress(),
      ward: faker.location.state(),
      district: faker.location.city(),
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      zipcode: faker.location.zipCode(),
      email: faker.internet.email(),
      phone: `0${userPhoneCounter++}`,
    });
  }
  const suppliers = await knex("suppliers")
    .insert(suppliersToInsert)
    .returning("*");
  console.log(`Created ${suppliers.length} suppliers...`);

  // Các phần còn lại giữ nguyên
  const categories = await knex("categories")
    .insert([{ name: "Rau củ" }, { name: "Trái cây" }])
    .returning("*");
  const productsToInsert = [];
  for (let i = 0; i < 20; i++) {
    productsToInsert.push({
      sku: `TEMP-SKU-${i}`,
      name: faker.commerce.productName(),
      category_id: faker.helpers.arrayElement(categories).id,
      price: faker.commerce.price({ min: 10000, max: 2000000, dec: 0 }),
      avatar: faker.image.urlLoremFlickr({ category: "food" }),
      status: "active",
      unit_of_measure: "kg",
      description: faker.lorem.paragraph(),
    });
  }
  const products = await knex("products")
    .insert(productsToInsert)
    .returning("*");
  const inventoriesToInsert = products.map((p) => ({
    product_id: p.id,
    supplier_id: faker.helpers.arrayElement(suppliers).id,
    quantity: faker.number.int({ min: 50, max: 200 }),
  }));
  await knex("inventories").insert(inventoriesToInsert);
  const addressesToInsert = users.map((u) => ({
    user_id: u.id,
    street: faker.location.streetAddress(),
    ward: faker.location.state(),
    district: faker.location.city(),
    city: "Hồ Chí Minh",
    country: "Việt Nam",
    zipcode: "700000",
  }));
  const customerAddresses = await knex("customer_address")
    .insert(addressesToInsert)
    .returning("*");
  for (let i = 0; i < 15; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const userAddress = customerAddresses.find(
      (a) => a.user_id === randomUser.id
    );
    const [order] = await knex("orders")
      .insert({
        customer_address_id: userAddress.id,
        user_id: randomUser.id,
        branch_id: faker.helpers.arrayElement(branches).id,
        status: "completed",
        total_amount: 0,
      })
      .returning("id");
    const numItems = faker.number.int({ min: 1, max: 3 });
    let totalAmount = 0;
    const orderDetailsToInsert = [];
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      totalAmount += product.price * quantity;
      orderDetailsToInsert.push({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price,
      });
    }
    await knex("order_details").insert(orderDetailsToInsert);
    await knex("orders")
      .where("id", order.id)
      .update({ total_amount: totalAmount });
  }
  console.log("Seeding complete!");
};
