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

  group("DELETE Category", function () {
    const createPayload = {
      name: `Category ${uniqueId}`,
      parent_id: "",
    };
    const createParams = {
      ...params,
      tags: { api: "createCategory" },
    };
    const createRes = http.post(
      `${BASE_URL}/categories/create`,
      createPayload,
      createParams
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const deleteParams = {
        ...params,
        tags: { api: "deleteCategory" },
      };
      const deleteRes = http.del(
        `${BASE_URL}/categories/delete/${newId}`,
        null,
        deleteParams
      );
      check(deleteRes, {
        "DELETE /categories: status 200": (r) => r.status === 200,
      });
    }
  });

  sleep(1);

  group("DELETE User", function () {
    const createParams = {
      ...params,
      tags: { api: "createUser" },
    };
    const createPayload = {
      full_name: `User ${uniqueId}`,
      status: "Active",
      username: `user${uniqueId}`,
      email: `user${uniqueId}@example.com`,
      phone: getRandomVietnamesePhone(),
      password: "123456",
      role_id: 1,
    };
    const createRes = http.post(
      `${BASE_URL}/users/create`,
      createPayload,
      createParams
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const deleteParams = {
        ...params,
        tags: { api: "deleteUser" },
      };
      const deleteRes = http.del(
        `${BASE_URL}/users/delete/${newId}`,
        null,
        deleteParams
      );
      check(deleteRes, {
        "DELETE /users: status 200": (r) => r.status === 200,
      });
    }
  });

  sleep(1);

  group("DELETE Product", function () {
    const createParams = {
      ...params,
      tags: { api: "createProduct" },
    };
    const createPayload = {
      name: `Product ${uniqueId}`,
      price: 100,
      status: "Active",
      unit_of_measure: "cai",
      category_id: 1,
      short_description: "Mo ta ngan",
      description: "Mo ta dai",
    };

    const createRes = http.post(
      `${BASE_URL}/products/create`,
      createPayload,
      createParams
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const deleteParams = {
        ...params,
        tags: { api: "deleteProduct" },
      };
      const deleteRes = http.del(
        `${BASE_URL}/products/delete/${newId}`,
        null,
        deleteParams
      );
      check(deleteRes, {
        "DELETE /products: status 200": (r) => r.status === 200,
      });
    }
  });

  sleep(1);

  group("DELETE Suppliers", function () {
    const createParams = {
      ...params,
      tags: { api: "createSupplier" },
    };
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
    const createRes = http.post(
      `${BASE_URL}/suppliers/create`,
      createPayload,
      createParams
    );

    try {
      newId = createRes.json("data.id");
    } catch (e) {
      newId = null;
    }

    if (newId) {
      sleep(0.5);
      const deleteParams = {
        ...params,
        tags: { api: "deleteSupplier" },
      };
      const deleteRes = http.del(
        `${BASE_URL}/suppliers/delete/${newId}`,
        null,
        deleteParams
      );
      check(deleteRes, {
        "DELETE /suppliers: status 200": (r) => r.status === 200,
      });
    }
  });

  sleep(2);
}
