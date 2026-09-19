module.exports = {
  ci: {
    collect: {
      startServerCommand: "python3 -m http.server 4174 --bind 127.0.0.1",
      startServerReadyPattern: "Serving HTTP",
      url: ["http://127.0.0.1:4174/"],
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
