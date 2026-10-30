import test from "node:test";
import assert from "node:assert/strict";
import { getLoginReturnPath } from "../src/lib/login-return.js";

test("returns to the selected astrologer after login", () => {
  assert.equal(getLoginReturnPath("?next=%2Fastrologer%2F18"), "/astrologer/18");
  assert.equal(getLoginReturnPath("?next=/astrologer/27"), "/astrologer/27");
});

test("normal login defaults to home", () => {
  assert.equal(getLoginReturnPath(), "/");
  assert.equal(getLoginReturnPath("?other=value"), "/");
});

test("rejects external destinations and non-profile routes", () => {
  for (const path of ["https://example.com", "//example.com", "/admin", "/login", "/astrologer/0", "/astrologer/18/../../admin", "/astrologer/18?next=//example.com", "/astrologer/18#fragment", "/\\example.com"]) {
    assert.equal(getLoginReturnPath(`?next=${encodeURIComponent(path)}`), "/", path);
  }
});
