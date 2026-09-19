const USERNAME_PATTERN = /^[\p{L}\p{M}\p{N}._-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

function characterCount(value) {
  return Array.from(value).length;
}

function normalizeIdentity(value) {
  return value.trim().normalize("NFKC");
}

export function validateUsername(value) {
  const username = normalizeIdentity(value);

  if (!username) return "Enter a username.";

  const length = characterCount(username);
  if (length < 3) return "Username must be at least 3 characters.";
  if (length > 20) return "Username must be 20 characters or fewer.";

  if (!USERNAME_PATTERN.test(username)) {
    return "Use only letters, numbers, dots, hyphens or underscores.";
  }

  return "";
}

export function validateEmail(value) {
  const email = normalizeIdentity(value);

  if (!email) return "Enter an email address.";
  if (email.length > 254) return "Email address is too long.";

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter an email in the format name@example.com.";
  }

  return "";
}

export function validatePassword(value, { username = "", email = "" } = {}) {
  if (!value) return "Enter a password.";

  const length = characterCount(value);
  if (length < 10) return "Password must be at least 10 characters.";
  if (length > 64) return "Password must be 64 characters or fewer.";
  if (/\s/u.test(value)) return "Password cannot contain spaces.";
  if (!/\p{L}/u.test(value) || !/\p{N}/u.test(value)) {
    return "Include at least one letter and one number.";
  }

  const normalizedPassword = value.normalize("NFKC").toLowerCase();
  const normalizedUsername = normalizeIdentity(username).toLowerCase();

  if (
    normalizedUsername.length >= 3 &&
    normalizedPassword.includes(normalizedUsername)
  ) {
    return "Password should not contain your username.";
  }

  const emailLocalPart =
    normalizeIdentity(email).split("@")[0]?.toLowerCase() ?? "";

  if (
    emailLocalPart.length >= 3 &&
    normalizedPassword.includes(emailLocalPart)
  ) {
    return "Password should not contain the first part of your email.";
  }

  return "";
}

export function validatePasswordConfirmation(value, password) {
  if (!value) return "Confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return "";
}

export function validateField(name, values) {
  switch (name) {
    case "username":
      return validateUsername(values.username);
    case "email":
      return validateEmail(values.email);
    case "password":
      return validatePassword(values.password, values);
    case "passwordConfirmation":
      return validatePasswordConfirmation(
        values.passwordConfirmation,
        values.password,
      );
    default:
      throw new Error("Unknown field: " + name);
  }
}

export function validateRegistration(values) {
  const fieldNames = [
    "username",
    "email",
    "password",
    "passwordConfirmation",
  ];

  const errors = Object.fromEntries(
    fieldNames.map((name) => [name, validateField(name, values)]),
  );

  return {
    valid: Object.values(errors).every((error) => error === ""),
    errors,
  };
}

export function getPasswordStrength(value) {
  if (!value) {
    return { score: 0, label: "not entered" };
  }

  let score = 0;
  if (characterCount(value) >= 10) score += 1;
  if (characterCount(value) >= 14) score += 1;
  if (/\p{L}/u.test(value) && /\p{N}/u.test(value)) score += 1;
  if (
    /[^\p{L}\p{N}\s]/u.test(value) ||
    (/[a-z]/u.test(value) && /[A-Z]/u.test(value))
  ) {
    score += 1;
  }

  const labels = ["very weak", "weak", "fair", "good", "strong"];
  return { score, label: labels[score] };
}
