import http from "k6/http";
import { sleep, check, group } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
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
  group("SELECT Categories", function () {
    const res = http.get(`${BASE_URL}/categories`, params);
    check(res, { "GET /categories: status 200": (r) => r.status === 200 });
  });

  sleep(1);

  group("SELECT Products", function () {
    const res = http.get(`${BASE_URL}/products`, params);
    check(res, { "GET /products: status 200": (r) => r.status === 200 });
  });

  sleep(1);

  group("SELECT Orders Branch A", function () {
    const res = http.get(`${BASE_URL}/orders?branch_id=1`, params);
    check(res, {
      "GET /orders?branch_id=1: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Orders Branch B", function () {
    const res = http.get(`${BASE_URL}/orders?branch_id=2`, params);
    check(res, {
      "GET /orders?branch_id=2: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Orders Branch C", function () {
    const res = http.get(`${BASE_URL}/orders?branch_id=3`, params);
    check(res, {
      "GET /orders?branch_id=3: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Users", function () {
    const res = http.get(`${BASE_URL}/users`, params);
    check(res, { "GET /users: status 200": (r) => r.status === 200 });
  });

  sleep(1);

  group("SELECT Suppliers", function () {
    const res = http.get(`${BASE_URL}/suppliers`, params);
    check(res, { "GET /suppliers: status 200": (r) => r.status === 200 });
  });

  sleep(1);

  group("SELECT Inventories Branch A", function () {
    const res = http.get(`${BASE_URL}/inventories?branch_id=1`, params);
    check(res, {
      "GET /inventories?branch_id=1: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Inventories Branch B", function () {
    const res = http.get(`${BASE_URL}/inventories?branch_id=2`, params);
    check(res, {
      "GET /inventories?branch_id=2: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Inventories Branch C", function () {
    const res = http.get(`${BASE_URL}/inventories?branch_id=3`, params);
    check(res, {
      "GET /inventories?branch_id=3: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("SELECT Branches", function () {
    const res = http.get(`${BASE_URL}/branches`, params);
    check(res, { "GET /branches: status 200": (r) => r.status === 200 });
  });

  sleep(2);
}
