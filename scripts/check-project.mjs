import { readFile } from "node:fs/promises";

const files = {
  html: await readFile("index.html", "utf8"),
  entry: await readFile("script.js", "utf8"),
  validation: await readFile("src/validation.js", "utf8"),
  css: await readFile("style.css", "utf8"),
};

const checks = [
  ["document language", /<html\s+lang="en"/u.test(files.html)],
  ["viewport metadata", /name="viewport"/u.test(files.html)],
  ["description metadata", /name="description"/u.test(files.html)],
  ["semantic main landmark", /<main\b/u.test(files.html)],
  ["one page heading", (files.html.match(/<h1\b/gu) ?? []).length === 1],
  ["module entry point", /<script\s+type="module"\s+src="\.\/script\.js"/u.test(files.html)],
  ["native required constraints", (files.html.match(/\brequired\b/gu) ?? []).length >= 4],
  ["accessible invalid state", /aria-invalid/u.test(files.entry)],
  ["announced error regions", (files.html.match(/aria-live="polite"/gu) ?? []).length >= 4],
  ["reduced motion support", /prefers-reduced-motion/u.test(files.css)],
  ["pure validation module has no DOM access", !/\b(document|window)\b/u.test(files.validation)],
  ["no runtime network request", !/\b(fetch|XMLHttpRequest|axios)\b/u.test(files.entry)],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [name, passed] of checks) {
  console.log((passed ? "✓" : "✗") + " " + name);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
