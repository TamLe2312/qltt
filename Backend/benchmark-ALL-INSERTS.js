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
    "http_req_duration{api:createProduct}": ["p(95)<1500"],
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

  group("INSERT Category", function () {
    const payload = {
      name: `Category ${uniqueId}`,
      parent_id: "",
    };

    const postParams = {
      ...params,
      tags: { api: "createCategory" },
    };
    const res = http.post(`${BASE_URL}/categories/create`, payload, postParams);
    check(res, { "POST /categories: status 201": (r) => r.status === 201 });
  });

  sleep(1);

  group("INSERT User", function () {
    const payload = {
      full_name: `User ${uniqueId}`,
      status: "active",
      username: `user${uniqueId}`,
      email: `user${uniqueId}@example.com`,
      phone: getRandomVietnamesePhone(),
      password: "123456",
      role_id: 1,
    };
    const postParams = {
      ...params,
      tags: { api: "createUser" },
    };
    const res = http.post(`${BASE_URL}/users/create`, payload, postParams);
    check(res, { "POST /users: status 201": (r) => r.status === 201 });
  });

  sleep(1);

  group("INSERT Suppliers", function () {
    const payload = {
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
      tags: { api: "createSupplier" },
    };
    const res = http.post(`${BASE_URL}/suppliers/create`, payload, postParams);
    check(res, { "POST /suppliers: status 201": (r) => r.status === 201 });
  });

  sleep(1);

  group("INSERT Product", function () {
    const payload = {
      name: `Product ${uniqueId}`,
      price: 100,
      status: "Active",
      unit_of_measure: "cai",
      short_description: "Mo ta ngan",
      description: "Mo ta dai",
      category_id: 1,
    };
    const postParams = {
      ...params,
      tags: { api: "createProduct" },
    };

    const res = http.post(`${BASE_URL}/products/create`, payload, postParams);

    check(res, {
      "POST /products: status 201": (r) => r.status === 201,
    });
  });

  sleep(1);

  group("INSERT Order", function () {
    const payload = JSON.stringify({
      user_id: 5,
      note: "Test order from k6",
      products: [{ product_id: 1, quantity: 1, price: 100 }],
      street: "123 Test Street",
      ward: "Ward 1",
      district: "District 1",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      zipcode: "700000",
      branch_id: 1,
    });

    const postParams = {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      tags: { api: "createOrder" },
    };
    const res = http.post(`${BASE_URL}/orders/create`, payload, postParams);
    check(res, { "POST /orders: status 201": (r) => r.status === 201 });
  });

  sleep(2);
}
