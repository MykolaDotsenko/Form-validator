import test from "node:test";
import assert from "node:assert/strict";

import {
  getPasswordStrength,
  validateEmail,
  validateField,
  validatePassword,
  validatePasswordConfirmation,
  validateRegistration,
  validateUsername,
} from "../src/validation.js";

test("username accepts practical international identifiers", () => {
  assert.equal(validateUsername("mykola.dev"), "");
  assert.equal(validateUsername("Микола_90"), "");
  assert.equal(validateUsername("e\u0301ric"), "");
});

test("username normalizes compatibility characters before validation", () => {
  assert.equal(validateUsername("Ｍｙｋｏｌａ"), "");
  assert.equal(
    validatePassword("mykola-Safe-2026", { username: "Ｍｙｋｏｌａ" }),
    "Password should not contain your username.",
  );
});

test("username enforces exact boundaries and supported characters", () => {
  assert.equal(validateUsername(""), "Enter a username.");
  assert.equal(
    validateUsername("ab"),
    "Username must be at least 3 characters.",
  );
  assert.equal(validateUsername("a".repeat(20)), "");
  assert.equal(
    validateUsername("a".repeat(21)),
    "Username must be 20 characters or fewer.",
  );
  assert.equal(
    validateUsername("name with spaces"),
    "Use only letters, numbers, dots, hyphens or underscores.",
  );
});

test("email uses a pragmatic format check", () => {
  assert.equal(validateEmail("person@example.com"), "");
  assert.equal(validateEmail(" person@example.com "), "");
  assert.equal(
    validateEmail("person@example"),
    "Enter an email in the format name@example.com.",
  );
  assert.equal(
    validateEmail("x".repeat(255) + "@example.com"),
    "Email address is too long.",
  );
});

test("password enforces length, whitespace and composition rules", () => {
  assert.equal(
    validatePassword("short1"),
    "Password must be at least 10 characters.",
  );
  assert.equal(
    validatePassword("onlyletterslong"),
    "Include at least one letter and one number.",
  );
  assert.equal(
    validatePassword("valid pass 2026"),
    "Password cannot contain spaces.",
  );
  assert.equal(validatePassword("A1-" + "x".repeat(61)), "");
  assert.equal(
    validatePassword("A1-" + "x".repeat(62)),
    "Password must be 64 characters or fewer.",
  );
  assert.equal(validatePassword("useful-pass-2026"), "");
});

test("password rejects normalized profile data reuse", () => {
  assert.equal(
    validatePassword("mykola-2026-safe", { username: "mykola" }),
    "Password should not contain your username.",
  );
  assert.equal(
    validatePassword("person-2026-safe", { email: "person@example.com" }),
    "Password should not contain the first part of your email.",
  );
});

test("confirmation must match exactly", () => {
  assert.equal(
    validatePasswordConfirmation("abc1234567", "abc1234567"),
    "",
  );
  assert.equal(
    validatePasswordConfirmation("abc1234568", "abc1234567"),
    "Passwords do not match.",
  );
});

test("field dispatcher rejects unsupported fields loudly", () => {
  assert.throws(
    () =>
      validateField("unknown", {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      }),
    /Unknown field: unknown/u,
  );
});

test("registration validates fields independently", () => {
  const result = validateRegistration({
    username: "ab",
    email: "wrong",
    password: "short",
    passwordConfirmation: "different",
  });

  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors), [
    "username",
    "email",
    "password",
    "passwordConfirmation",
  ]);
  assert.ok(Object.values(result.errors).every(Boolean));
});

test("registration passes for a valid payload", () => {
  const result = validateRegistration({
    username: "niko.dev",
    email: "niko@example.com",
    password: "Signal-Bridge-2026",
    passwordConfirmation: "Signal-Bridge-2026",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
});

test("password strength is deterministic and bounded", () => {
  assert.deepEqual(getPasswordStrength(""), {
    score: 0,
    label: "not entered",
  });
  assert.deepEqual(getPasswordStrength("abcdefghij"), {
    score: 1,
    label: "weak",
  });

  const strong = getPasswordStrength("Longer-Password-2026");
  assert.equal(strong.score, 4);
  assert.equal(strong.label, "strong");
});
