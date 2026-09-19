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

function requireElement(selector) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error("Required element is missing: " + selector);
  }

  return element;
}

const form = requireElement("#registration-form");
const summary = requireElement("#form-summary");
const successPanel = requireElement("#success-panel");
const successMessage = requireElement("#success-message");
const passwordToggle = requireElement("#password-toggle");
const startOverButton = requireElement("#start-over");
const strengthLabel = requireElement("#password-strength-label");
const strengthSegments = [
  ...document.querySelectorAll("[data-strength-segment]"),
];

if (!(form instanceof HTMLFormElement)) {
  throw new Error("#registration-form must be a form element.");
}

if (strengthSegments.length !== 4) {
  throw new Error("Password strength meter must contain exactly four segments.");
}

const fields = Object.fromEntries(
  FIELD_NAMES.map((name) => {
    const element = form.elements.namedItem(name);

    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Required form control is missing: " + name);
    }

    return [name, element];
  }),
);

const touched = new Set();
let lastStrengthAnnouncement = "not entered";

function readValues() {
  return Object.fromEntries(
    FIELD_NAMES.map((name) => [name, fields[name].value]),
  );
}

function errorElementFor(name) {
  const id =
    name === "passwordConfirmation"
      ? "password-confirmation-error"
      : name + "-error";
  return requireElement("#" + id);
}

const errorElements = Object.fromEntries(
  FIELD_NAMES.map((name) => [name, errorElementFor(name)]),
);

const fieldContainers = Object.fromEntries(
  FIELD_NAMES.map((name) => {
    const element = requireElement('[data-field="' + name + '"]');
    return [name, element];
  }),
);

function renderFieldState(name, error) {
  const input = fields[name];
  const container = fieldContainers[name];
  const errorElement = errorElements[name];
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

function renderPasswordStrength({ forceAnnouncement = false } = {}) {
  const { score, label } = getPasswordStrength(fields.password.value);

  strengthSegments.forEach((segment, index) => {
    segment.dataset.active = String(index < score);
  });

  if (forceAnnouncement || label !== lastStrengthAnnouncement) {
    strengthLabel.textContent = "Password strength: " + label;
    lastStrengthAnnouncement = label;
  }
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
    fields[invalidNames[0]].focus();
    return;
  }

  hideSummary();
  form.hidden = true;
  successMessage.textContent =
    "The demo accepted " +
    values.email.trim() +
    ". No data was transmitted or stored.";
  successPanel.hidden = false;
  successPanel.focus();
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
    delete fieldContainers[name].dataset.state;
    errorElements[name].textContent = "";
    fields[name].removeAttribute("aria-invalid");
  });

  fields.password.type = "password";
  fields.passwordConfirmation.type = "password";
  passwordToggle.setAttribute("aria-pressed", "false");
  passwordToggle.textContent = "Show passwords";
  lastStrengthAnnouncement = "";
  renderPasswordStrength({ forceAnnouncement: true });

  successPanel.hidden = true;
  form.hidden = false;
  fields.username.focus();
}

form.addEventListener("input", handleInput);
form.addEventListener("focusout", handleBlur);
form.addEventListener("submit", handleSubmit);
passwordToggle.addEventListener("click", handlePasswordToggle);
startOverButton.addEventListener("click", resetExperience);

document.documentElement.dataset.enhanced = "true";
form.noValidate = true;
renderPasswordStrength();
