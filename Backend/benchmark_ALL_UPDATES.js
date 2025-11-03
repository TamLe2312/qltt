import http from "k6/http";
import { sleep, check, group } from "k6";

function getRandomVietnamesePhone() {
  const prefixes = [
    "090",
    "091",
    "093",
    "094",
    "096",
    "097",
    "098",
    "086",
    "088",
    "089",
    "070",
    "076",
    "077",
    "078",
    "079",
    "032",
    "033",
    "034",
    "035",
    "036",
    "037",
    "038",
    "039",
    "081",
    "082",
    "083",
    "084",
    "085",
    "056",
    "058",
    "059",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  const suffix = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");

  return prefix + suffix;
}

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

const BASE_URL = "http://localhost:3030/api";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZnVsbF9uYW1lIjoiTMOqIE1pbmggVMOibSAyIiwidXNlcm5hbWUiOiJ0YW1sZTIzMTIyMDA0IiwiZW1haWwiOiJ0YW1sZTIzMTIyMDA0QGdtYWlsLmNvbSIsInBob25lIjoiMDgxNzY0MzMzNSIsInJvbGVJZCI6MSwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzYyMTMxNzYyLCJleHAiOjE3NjIxMzUzNjJ9.J9Kzo90y_x4aJ1oyWaBZ1QAxGCUA6kP_XZd2z78mVgI";

const params = {
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
};

export default function () {
  const uniqueId = `VU${__VU}-ITER${__ITER}`;
  let newId = null;

  group("UPDATE Category", function () {
    const createPayload = {
      name: `Category ${uniqueId}`,
      parent_id: "",
    };
    const postParams = {
      ...params,
    };
    const createRes = http.post(
      `${BASE_URL}/categories/create`,
      createPayload,
      postParams,
      { tags: { api: "createCategory" } }
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const updatePayload = {
        name: `Category ${uniqueId}-UPDATED`,
      };
      const updateRes = http.put(
        `${BASE_URL}/categories/update/${newId}`,
        updatePayload,
        postParams,
        { tags: { api: "updateCategory" } }
      );
      check(updateRes, {
        "PUT /categories: status 201": (r) => r.status === 201,
      });
    }
  });

  sleep(1);

  group("UPDATE User", function () {
    const createPayload = {
      full_name: `User ${uniqueId}`,
      status: "Active",
      username: `user${uniqueId}`,
      email: `user${uniqueId}@example.com`,
      phone: getRandomVietnamesePhone(),
      password: "123456",
      role_id: 1,
    };
    const postParams = {
      ...params,
    };
    const createRes = http.post(
      `${BASE_URL}/users/create`,
      createPayload,
      postParams,
      { tags: { api: "createUser" } }
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const updatePayload = {
        full_name: `User ${uniqueId}-UPDATED`,
        status: "Inactive",
        username: `user${uniqueId}-UPDATED`,
        email: `user${uniqueId}-UPDATED@example.com`,
        phone: getRandomVietnamesePhone(),
        password: "123456",
      };

      const updateRes = http.put(
        `${BASE_URL}/users/update/${newId}`,
        updatePayload,
        postParams,
        { tags: { api: "updateUser" } }
      );
      check(updateRes, { "PUT /users: status 201": (r) => r.status === 201 });
    }
  });

  sleep(1);

  group("UPDATE Product", function () {
    const createPayload = {
      name: `Product ${uniqueId}`,
      price: 100,
      status: "Active",
      unit_of_measure: "cai",
      category_id: 1,
      short_description: "Mo ta ngan",
      description: "Mo ta dai",
    };
    const postParams = {
      ...params,
    };
    const createRes = http.post(
      `${BASE_URL}/products/create`,
      createPayload,
      postParams,
      { tags: { api: "createProduct" } }
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const updatePayload = {
        name: `Product ${uniqueId}-UPDATED`,
        price: 999,
        status: "Inactive",
        unit_of_measure: "cai",
        category_id: 1,
        short_description: "Mo ta ngan",
        description: "Mo ta dai",
      };
      const updateRes = http.put(
        `${BASE_URL}/products/update/${newId}`,
        updatePayload,
        postParams,
        { tags: { api: "updateProduct" } }
      );
      check(updateRes, {
        "PUT /products: status 201": (r) => r.status === 201,
      });
    }
  });

  sleep(1);

  group("UPDATE Suppliers", function () {
    const createPayload = {
      name: `Supplier ${uniqueId}`,
      street: "123 Test Street",
      ward: "Ward 1",
      district: "District 1",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      zipcode: "700000",
      email: `supplier${uniqueId}@example.com`,
      phone: getRandomVietnamesePhone(),
    };
    const postParams = {
      ...params,
    };
    const createRes = http.post(
      `${BASE_URL}/suppliers/create`,
      createPayload,
      postParams,
      { tags: { api: "createSupplier" } }
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const updatePayload = {
        name: `Supplier ${uniqueId}-UPDATED`,
        street: "123 Test Street",
        ward: "Ward 1",
        district: "District 1",
        city: "Ho Chi Minh City",
        country: "Vietnam",
        zipcode: "700000",
        email: `supplier${uniqueId}-updated@example.com`,
        phone: getRandomVietnamesePhone(),
      };
      const updateRes = http.put(
        `${BASE_URL}/suppliers/update/${newId}`,
        updatePayload,
        postParams,
        { tags: { api: "updateSupplier" } }
      );
      check(updateRes, {
        "PUT /suppliers: status 201": (r) => r.status === 201,
      });
    }
  });

  sleep(2);
}
