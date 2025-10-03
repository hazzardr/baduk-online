import http from "k6/http";
import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

const url = "http://localhost:4000/api/v1";

export const options = {
  iterations: 1,
};

export default function () {
  const body = JSON.stringify({
    name: "test",
    email: "rbrianhazzard+aws@protonmail.com",
    password: "mySecretPw",
  });
  let res = http.post(`${url}/users`, body, {
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status).toBe(201);
  sleep(1);
}
