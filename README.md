# FormGuard — Accessible Validation Lab

[![Quality](https://github.com/MykolaDotsenko/Form-validator/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Form-validator/actions/workflows/quality.yml)

**A dependency-free registration form rebuilt as a compact frontend engineering case study.**

FormGuard demonstrates how a small interaction can still deserve clear boundaries, useful validation, accessible feedback, resilient progressive enhancement, and automated verification — without introducing a framework that the product does not need.

## What the user can do

- create a demo registration with username, email and password fields
- receive validation after leaving a field, without being interrupted on every keystroke
- see errors update while correcting an already-touched field
- reveal or hide both password fields
- get a deterministic password-strength indicator
- recover quickly from invalid input with focus moved to the first field requiring attention
- complete a success flow without sending or storing personal data
- restart the experience without reloading the page

## Engineering highlights

- **zero runtime dependencies**
- pure validation rules isolated from the browser
- thin DOM adapter responsible only for interaction and rendering
- Unicode-aware username and password rules
- pragmatic email validation instead of an unreadable RFC-style expression
- native HTML constraints retained as a no-JavaScript fallback
- custom validation enabled only after the JavaScript enhancement boots
- dependent-field revalidation for password/profile relationships
- deterministic password-strength scoring
- explicit error, valid and success states
- screen-reader announcements with `aria-live`
- `aria-invalid` kept in sync with the rendered state
- visible keyboard focus states
- skip navigation
- `prefers-reduced-motion` support
- responsive desktop/mobile layout
- no network requests, analytics, storage or form submission
- Node built-in unit tests
- structural architecture/accessibility checks
- GitHub Actions quality gate

## Stack

- semantic HTML5
- modern CSS
- Vanilla JavaScript with native ES modules
- Unicode property escapes
- Node.js built-in test runner
- GitHub Actions

There is intentionally no React, validation library, state-management package, CSS framework or build pipeline.

For four fields and one local interaction flow, those tools would increase surface area without solving a product requirement.

## Architecture

```text
index.html
    |
    v
script.js -------------------- browser / DOM adapter
    |
    v
src/validation.js ------------ pure validation domain
```

The important dependency rule is simple:

> validation rules do not know that a browser exists.

`src/validation.js` has no access to `window`, `document`, form elements, CSS classes or storage. That makes the behavior deterministic, portable and easy to test.

`script.js` owns the browser-specific work:

- reading form values
- tracking touched fields
- deciding when to display feedback
- synchronizing `aria-invalid`
- updating the strength meter
- handling password visibility
- moving focus after an invalid submit
- switching to the success state

See [ARCHITECTURE.md](./ARCHITECTURE.md) for trade-offs and design decisions.

## Validation policy

### Username

- required
- 3–20 Unicode characters
- letters, numbers, dots, hyphens and underscores

### Email

- required
- maximum 254 characters
- pragmatic `local@domain.tld` shape validation

The browser/client cannot prove that an address exists. A real registration system would confirm ownership server-side.

### Password

- required
- 10–64 characters
- at least one Unicode letter
- at least one number
- no whitespace
- cannot contain the username
- cannot contain the local part of the email

The strength indicator is guidance only; it is deliberately separate from the pass/fail validation contract.

### Confirmation

- required
- must match the password exactly

## Accessibility strategy

The enhanced form avoids showing errors before the user has interacted with a field.

After a field is blurred, it becomes **touched**. From that point onward, feedback updates during correction. On submit, every field is validated and focus moves to the first invalid control.

Each input has:

- a programmatic `label`
- contextual hint text where useful
- a dedicated live error region
- synchronized `aria-invalid`
- a visible `:focus-visible` state
- appropriate `autocomplete` and input semantics

The page also includes skip navigation and a reduced-motion mode.

## Progressive enhancement

The HTML contains native `required`, length and input-type constraints.

JavaScript sets `form.noValidate = true` only after the enhanced validator has loaded successfully. If JavaScript is unavailable, the browser's native constraint validation remains available instead of leaving an unprotected form.

## Security boundary

Client-side validation improves UX; it is **not** a security boundary.

A production backend must independently validate and normalize every submitted value, rate-limit abusive requests, protect credentials, and own account creation. This demo intentionally performs no network request and stores no personal data.

## Tests

Run the complete quality gate:

```bash
npm ci
npm run check
```

The test suite covers:

- international usernames
- empty/short/unsupported usernames
- valid and invalid email shapes
- password length/composition rules
- rejection of profile data inside passwords
- exact password confirmation
- complete invalid registration payloads
- complete valid registration payloads
- deterministic password-strength scoring

The structural checker additionally verifies important repository invariants such as semantic markup, accessibility wiring, reduced-motion support and separation of DOM access from the validation domain.

## Run locally

Because the project uses native ES modules, serve it over HTTP:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No application installation is required to run the UI.

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── quality.yml
├── scripts/
│   └── check-project.mjs
├── src/
│   └── validation.js
├── tests/
│   └── validation.test.js
├── ARCHITECTURE.md
├── index.html
├── package-lock.json
├── package.json
├── script.js
├── style.css
└── README.md
```

## Evolution

The original learning exercise placed required checks, length checks, email parsing, password matching and DOM styling in one global script.

The current version preserves the small Vanilla JavaScript stack while improving the parts that matter in real product work:

- correctness
- interaction timing
- accessibility
- testability
- architectural boundaries
- documentation
- automated verification

That is the point of this repository: **more engineering value without unnecessary engineering weight.**
