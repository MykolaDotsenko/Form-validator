import {
  getPasswordStrength,
  validateField,
  validateRegistration,
} from "./src/validation.js";

const FIELD_NAMES = [
  "username",
  "email",
  "password",
  "passwordConfirmation",
];

const form = document.querySelector("#registration-form");
const summary = document.querySelector("#form-summary");
const successPanel = document.querySelector("#success-panel");
const successMessage = document.querySelector("#success-message");
const passwordToggle = document.querySelector("#password-toggle");
const startOverButton = document.querySelector("#start-over");
const strengthLabel = document.querySelector("#password-strength-label");
const strengthSegments = [...document.querySelectorAll("[data-strength-segment]")];

if (!form || !summary || !successPanel) {
  throw new Error("Registration form markup is incomplete.");
}

const fields = Object.fromEntries(
  FIELD_NAMES.map((name) => [name, form.elements.namedItem(name)]),
);

const touched = new Set();

function readValues() {
  return Object.fromEntries(
    FIELD_NAMES.map((name) => [name, fields[name]?.value ?? ""]),
  );
}

function errorElementFor(name) {
  const id =
    name === "passwordConfirmation"
      ? "password-confirmation-error"
      : name + "-error";

  return document.getElementById(id);
}

function fieldContainerFor(name) {
  return form.querySelector('[data-field="' + name + '"]');
}

function renderFieldState(name, error) {
  const input = fields[name];
  const container = fieldContainerFor(name);
  const errorElement = errorElementFor(name);

  if (!input || !container || !errorElement) return;

  const hasValue = input.value.length > 0;
  const hasError = Boolean(error);

  input.setAttribute("aria-invalid", String(hasError));
  errorElement.textContent = error;

  if (hasError) {
    container.dataset.state = "error";
  } else if (touched.has(name) && hasValue) {
    container.dataset.state = "valid";
  } else {
    delete container.dataset.state;
  }
}

function validateAndRender(name) {
  const error = validateField(name, readValues());
  renderFieldState(name, error);
  return error;
}

function renderPasswordStrength() {
  const { score, label } = getPasswordStrength(fields.password.value);

  strengthSegments.forEach((segment, index) => {
    segment.dataset.active = String(index < score);
  });

  strengthLabel.textContent = "Password strength: " + label;
}

function hideSummary() {
  summary.hidden = true;
  summary.textContent = "";
}

function showSummary(errorCount) {
  summary.textContent =
    errorCount === 1
      ? "1 field needs your attention."
      : errorCount + " fields need your attention.";
  summary.hidden = false;
}

function handleInput(event) {
  const name = event.target?.name;
  if (!FIELD_NAMES.includes(name)) return;

  hideSummary();

  if (name === "password") {
    renderPasswordStrength();
  }

  if (touched.has(name)) {
    validateAndRender(name);
  }

  if (
    (name === "username" || name === "email") &&
    touched.has("password")
  ) {
    validateAndRender("password");
  }

  if (name === "password" && touched.has("passwordConfirmation")) {
    validateAndRender("passwordConfirmation");
  }
}

function handleBlur(event) {
  const name = event.target?.name;
  if (!FIELD_NAMES.includes(name)) return;

  touched.add(name);
  validateAndRender(name);
}

function handleSubmit(event) {
  event.preventDefault();

  FIELD_NAMES.forEach((name) => touched.add(name));

  const values = readValues();
  const result = validateRegistration(values);

  FIELD_NAMES.forEach((name) => {
    renderFieldState(name, result.errors[name]);
  });

  if (!result.valid) {
    const invalidNames = FIELD_NAMES.filter((name) => result.errors[name]);
    showSummary(invalidNames.length);
    fields[invalidNames[0]]?.focus();
    return;
  }

  hideSummary();
  form.hidden = true;
  successMessage.textContent =
    "The demo accepted " + values.email.trim() + ". No data was transmitted or stored.";
  successPanel.hidden = false;
  successPanel.focus?.();
}

function handlePasswordToggle() {
  const reveal = fields.password.type === "password";
  const nextType = reveal ? "text" : "password";

  fields.password.type = nextType;
  fields.passwordConfirmation.type = nextType;
  passwordToggle.setAttribute("aria-pressed", String(reveal));
  passwordToggle.textContent = reveal ? "Hide passwords" : "Show passwords";
}

function resetExperience() {
  form.reset();
  touched.clear();
  hideSummary();

  FIELD_NAMES.forEach((name) => {
    const container = fieldContainerFor(name);
    const errorElement = errorElementFor(name);
    fields[name]?.removeAttribute("aria-invalid");
    if (container) delete container.dataset.state;
    if (errorElement) errorElement.textContent = "";
  });

  fields.password.type = "password";
  fields.passwordConfirmation.type = "password";
  passwordToggle.setAttribute("aria-pressed", "false");
  passwordToggle.textContent = "Show passwords";
  renderPasswordStrength();

  successPanel.hidden = true;
  form.hidden = false;
  fields.username?.focus();
}

form.noValidate = true;
form.addEventListener("input", handleInput);
form.addEventListener("focusout", handleBlur);
form.addEventListener("submit", handleSubmit);
passwordToggle.addEventListener("click", handlePasswordToggle);
startOverButton.addEventListener("click", resetExperience);

renderPasswordStrength();
