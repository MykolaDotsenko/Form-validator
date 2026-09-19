import { readFile } from "node:fs/promises";

const files = {
  html: await readFile("index.html", "utf8"),
  entry: await readFile("script.js", "utf8"),
  validation: await readFile("src/validation.js", "utf8"),
  css: await readFile("style.css", "utf8"),
  e2e: await readFile("e2e/formguard.spec.js", "utf8"),
  playwright: await readFile("playwright.config.js", "utf8"),
};

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

const checks = [
  ["document language", /<html\s+lang="en"/u.test(files.html)],
  ["viewport metadata", /name="viewport"/u.test(files.html)],
  ["description metadata", /name="description"/u.test(files.html)],
  ["canonical URL", /rel="canonical"\s+href="https:\/\/mykoladotsenko\.github\.io\/Form-validator\/"/u.test(files.html)],
  ["Open Graph metadata", /property="og:title"/u.test(files.html) && /property="og:url"/u.test(files.html)],
  ["social image metadata", /property="og:image"/u.test(files.html) && /name="twitter:image"/u.test(files.html)],
  ["semantic main landmark", /<main\b/u.test(files.html)],
  ["one page heading", (files.html.match(/<h1\b/gu) ?? []).length === 1],
  ["module entry point", /<script\s+type="module"\s+src="\.\/script\.js"/u.test(files.html)],
  ["native required constraints", (files.html.match(/\brequired\b/gu) ?? []).length >= 4],
  ["focusable success region", /id="success-panel"[^>]*tabindex="-1"/u.test(files.html)],
  ["accessible invalid state", /aria-invalid/u.test(files.entry)],
  ["announced error regions", (files.html.match(/aria-live="polite"/gu) ?? []).length >= 4],
  ["reduced motion support", /prefers-reduced-motion/u.test(files.css)],
  ["fail-safe required-element guard", /function requireElement\(/u.test(files.entry)],
  ["enhanced mode is explicit", /dataset\.enhanced/u.test(files.entry) && /form\.noValidate = true/u.test(files.entry)],
  ["pure validation module has no DOM access", !/\b(document|window)\b/u.test(files.validation)],
  ["no runtime network request", !/\b(fetch|XMLHttpRequest|axios)\b/u.test(files.entry)],
  ["zero runtime package dependencies", packageJson.dependencies === undefined],
  ["pinned browser tool bootstrap", /@playwright\/test@1\.63\.0/u.test(packageJson.scripts["test:e2e:deps"] ?? "")],
  ["cross-browser matrix", /chromium-desktop/u.test(files.playwright) && /firefox-desktop/u.test(files.playwright) && /chromium-mobile/u.test(files.playwright)],
  ["automated axe scan", /AxeBuilder/u.test(files.e2e)],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [name, passed] of checks) {
  console.log((passed ? "✓" : "✗") + " " + name);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
