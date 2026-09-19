# FormGuard — Accessible Validation Lab

[![Quality](https://github.com/MykolaDotsenko/Form-validator/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Form-validator/actions/workflows/quality.yml)

**A dependency-free registration flow rebuilt as a compact frontend engineering case study.**

[**Open the live demo →**](https://mykoladotsenko.github.io/Form-validator/) · [Architecture](./ARCHITECTURE.md) · [Browser tests](./e2e/formguard.spec.js)

FormGuard shows how a small interaction can still deserve clear boundaries, useful validation, accessible feedback, progressive enhancement, cross-browser verification, and automated quality gates — without introducing a framework the product does not need.

## Why this project is interesting

The original repository was a conventional four-field JavaScript exercise.

The current implementation deliberately keeps the same small problem domain while applying production-minded engineering discipline:

- **zero runtime dependencies**
- pure validation rules isolated from the browser
- thin DOM and interaction adapter
- fail-safe progressive enhancement
- accessible touched-field feedback
- deterministic password-strength guidance
- Unicode-aware identity validation
- unit and boundary tests
- Playwright end-to-end coverage
- Chromium desktop, Firefox desktop and Chromium mobile verification
- automated axe accessibility analysis
- GitHub Actions quality gates
- Dependabot maintenance
- GitHub Pages deployment

The goal is not to make a form look enterprise-sized. It is to show **how to make a small system reliable without making it complicated**.

## Product behavior

1. Enter username, email and password details.
2. Leave a field to receive contextual validation.
3. Correct touched fields with immediate recovery feedback.
4. Submit the form.
5. Invalid submission focuses the first problem field.
6. Valid submission moves focus to an accessible success state.
7. Reset restores a clean form and keyboard focus.

Nothing is transmitted, stored, tracked, or persisted.

## Quality evidence

| Layer | Verification |
| --- | --- |
| Pure validation | Node built-in unit tests |
| Boundary behavior | exact min/max, Unicode normalization, dependent rules |
| Architecture | structural invariant checker |
| Browser behavior | Playwright end-to-end flows |
| Desktop | Chromium + Firefox |
| Mobile | Chromium mobile emulation |
| Accessibility | axe analysis of initial, invalid and success states |
| Performance/SEO | Lighthouse CI quality budgets |
| CI | separate static and browser jobs |
| Supply chain | zero runtime packages; pinned test tooling |
| Deployment | GitHub Pages |

Browser failures retain Playwright traces, screenshots, and video where applicable. CI uploads short-lived browser evidence artifacts.

## Runtime stack

- semantic HTML5
- modern CSS
- Vanilla JavaScript
- native ES modules
- Unicode property escapes

## Verification stack

- Node.js built-in test runner
- Playwright 1.63.0
- @axe-core/playwright 4.13.0
- Lighthouse CI 0.15.1
- GitHub Actions
- Dependabot

Playwright and axe are test-only tooling. The shipped application still has zero runtime dependencies.

## Architecture

    index.html / style.css
              ↑
              |
          script.js
     browser adapter +
     interaction state
              |
              ↓
     src/validation.js
      pure domain rules

The key dependency rule is:

> **Validation rules do not know that a browser exists.**

The validation module has no access to window, document, form elements, CSS classes, storage, or the network.

The browser adapter owns only:

- required element discovery
- form value extraction
- touched-field state
- event handling
- accessibility attributes
- focus management
- password visibility
- success and reset transitions

All required DOM references are resolved **before** custom validation disables native browser validation. If enhanced mode cannot bootstrap, the HTML keeps its native constraints instead of failing into a partially enhanced state.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the design rationale.

## Validation policy

### Username

- required
- 3–20 normalized Unicode characters
- letters, combining marks, numbers, dots, hyphens and underscores
- NFKC compatibility normalization before validation

### Email

- required
- maximum 254 normalized characters
- pragmatic local@domain.tld shape validation

A client cannot prove that an email exists. Ownership verification belongs on the server.

### Password

- required
- 10–64 characters
- at least one Unicode letter
- at least one number
- no whitespace
- cannot contain the normalized username
- cannot contain the normalized local part of the email

The password value itself is not rewritten or stored. Normalization is used only for identity comparisons.

### Password strength

Strength is advisory and deliberately separate from validity. The live announcement updates only when the strength category changes, reducing screen-reader noise.

## Accessibility model

Untouched fields stay quiet. After blur, a field becomes touched and receives feedback while the user corrects it.

The interface includes:

- programmatic labels
- contextual descriptions
- dedicated live error regions
- synchronized aria-invalid state
- aria-atomic for complete feedback
- visible keyboard focus
- first-error focus recovery
- focus transfer to success confirmation
- skip navigation
- reduced-motion support
- responsive touch targets
- automated axe checks across multiple product states

Automated accessibility checks do not replace manual assistive-technology testing, but they make common regressions much harder to merge unnoticed.

## Progressive enhancement

Native HTML required, length, type, autocomplete, and input semantics remain in the document.

JavaScript enables custom validation only after every required interface element has been verified.

If the enhanced layer cannot initialize, native browser validation remains available.

## Security boundary

Client-side validation is UX, **not security**.

A production backend would still own request validation, normalization, duplicate-account handling, secure password hashing, email verification, authentication/session protections, rate limiting, and observability.

This demo makes no network request and stores no submitted values.

## Run locally

Serve the repository over HTTP:

    python3 -m http.server 8000

Then open http://localhost:8000.

No runtime dependency installation is required.

## Run static quality checks

    npm ci
    npm run check

This executes syntax checks, unit/boundary tests, and structural architecture/accessibility/presentation invariants.

## Run browser and accessibility tests

Install the pinned test-only tools and browser engines:

    npm run test:e2e:deps
    npx playwright install chromium firefox
    npm run test:e2e

The browser suite verifies touched-field timing, recovery, focus behavior, dependent password rules, password visibility, success/reset flows, responsive presentation, and automated axe scans.

Lighthouse CI also enforces portfolio quality budgets for performance, accessibility, best practices, and SEO.

## Project structure

    .
    ├── .github/
    │   ├── dependabot.yml
    │   └── workflows/quality.yml
    ├── e2e/formguard.spec.js
    ├── scripts/check-project.mjs
    ├── src/validation.js
    ├── tests/validation.test.js
    ├── ARCHITECTURE.md
    ├── LICENSE
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── playwright.config.js
    ├── lighthouserc.cjs
    ├── script.js
    └── style.css

## Engineering trade-off

React, a form library, schema library, state library, and CSS framework could all solve this problem.

They would also increase maintenance surface without adding product value for four fields and one local interaction flow.

For the current scope, native browser APIs plus a pure domain module provide the highest signal-to-complexity ratio.

**More engineering value, not more engineering weight.**
