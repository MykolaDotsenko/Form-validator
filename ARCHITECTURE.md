# Architecture

## Goal

FormGuard is intentionally a small system.

The architectural goal is not to demonstrate the maximum number of patterns. It is to make the few important responsibilities explicit enough that a new developer can understand the complete application quickly and change validation rules without touching presentation code.

## Dependency direction

```text
HTML / CSS
    ^
    |
script.js       browser adapter + interaction state
    |
    v
validation.js   pure domain rules
```

The lower layer never imports from the upper layer.

### `src/validation.js`

Owns deterministic rules only:

- username policy
- email shape policy
- password policy
- password confirmation
- registration-level aggregation
- password-strength scoring

Inputs are plain strings/objects. Outputs are plain strings/objects.

It has no browser API dependency and can run unchanged in Node.js.

### `script.js`

Acts as the composition root and browser adapter.

It owns:

- element lookup
- form value extraction
- touched-field interaction state
- blur/input/submit event handling
- accessibility attributes
- visual state markers
- password visibility
- focus recovery
- success/reset transitions

Validation decisions are delegated to the pure module.

### HTML

The document retains useful native constraints even though the enhanced JavaScript experience uses custom feedback.

This is deliberate progressive enhancement: JavaScript disables native validation only after the module has loaded successfully.

### CSS

CSS owns all visual state.

JavaScript communicates only a small state vocabulary through `data-state` and accessibility attributes. It does not write inline presentation styles.

## Interaction state

There is no global state library.

The only transient state that is not already represented by the DOM is a `Set` of touched field names.

That state answers one product question:

> Has the user interacted enough with this field that proactive error feedback is now helpful?

Untouched fields stay quiet. Touched fields validate during correction. Submit validates everything.

## Dependent validation

Password policy depends on username and email because obvious profile-data reuse is rejected.

For that reason:

- editing username/email revalidates password if password is already touched
- editing password revalidates confirmation if confirmation is already touched

This prevents a previously valid field from silently becoming invalid after one of its dependencies changes.

## Error model

Validators return an empty string for success or one actionable error message for failure.

For this product size, returning the first relevant error is preferable to returning a list of every possible error:

- less screen-reader noise
- lower cognitive load
- simpler rendering contract
- faster correction loop

A more complex onboarding flow could return structured error codes, but that would not add useful value here.

## Password strength vs validity

Strength and validity are intentionally separate concepts.

A password can satisfy the minimum product policy without receiving the highest strength score. The meter is advisory UX, not another hidden acceptance rule.

This avoids a common form-design failure where users must infer undocumented password requirements from a changing meter.

## Email validation trade-off

The client uses a deliberately pragmatic expression rather than attempting full RFC 5322 validation.

Client-side syntax checks should catch obvious mistakes, not claim that an address exists or can receive mail.

Production ownership verification belongs to an email-confirmation flow on the server.

## Security model

This repository contains no backend.

Therefore:

- no account is actually created
- no password is persisted
- no form data is transmitted
- no client-side rule should be treated as authorization or security validation

A production implementation must repeat validation server-side and apply authentication, rate limiting, CSRF/session protections as appropriate.

## Testing strategy

The highest-value behavior lives in the pure validation module, so it receives direct unit tests with Node's built-in test runner.

A lightweight repository checker guards structural invariants that are easy to regress:

- semantic page language and landmarks
- one `h1`
- module entry point
- native required constraints
- live error regions
- `aria-invalid` integration
- reduced-motion support
- no DOM access in the domain module
- no network request in the browser adapter

This keeps the quality system proportional and dependency-free.

## Why no framework?

React would be a reasonable choice if the product grew into:

- a multi-step onboarding flow
- reusable form composition across routes
- server-backed async validation
- complex account state
- a larger design system

None of those requirements exist here.

Native ES modules and browser APIs provide the clearest implementation for the current scope.

## Future production work

If this became a real registration product, the next architectural boundary would be a backend API with:

- authoritative request validation
- normalized identities
- secure password hashing
- email verification
- duplicate-account handling
- throttling/rate limiting
- telemetry and abuse monitoring
- integration/browser tests against the real API

Those capabilities are intentionally outside this client-only case study.
