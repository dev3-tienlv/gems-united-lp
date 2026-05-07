import { readFileSync } from "node:fs";

const statsPath = ".next/diagnostics/route-bundle-stats.json";

const BUDGET_BY_ROUTE = {
  "/": 590000,
  "/blogs": 585000,
  "/blog/[slug]": 585000,
  "/careers": 585000,
  "/careers/[id]": 585000,
};

function readStats() {
  try {
    const raw = readFileSync(statsPath, "utf8");
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Cannot read ${statsPath}. Run \`npm run build\` first so route diagnostics are generated.`,
    );
  }
}

const stats = readStats();
const violations = [];

for (const [route, budget] of Object.entries(BUDGET_BY_ROUTE)) {
  const found = stats.find((item) => item.route === route);
  if (!found) {
    process.stderr.write(`[budget] Route not found in diagnostics: ${route}\n`);
    continue;
  }

  const size = found.firstLoadUncompressedJsBytes;
  if (size > budget) {
    violations.push({ route, size, budget });
  }
}

if (violations.length > 0) {
  process.stderr.write("[budget] Route JS budget exceeded:\n");
  for (const item of violations) {
    process.stderr.write(
      ` - ${item.route}: ${item.size} bytes (budget ${item.budget}, over ${item.size - item.budget})\n`,
    );
  }
  process.exit(1);
}

process.stdout.write("[budget] All route JS budgets passed.\n");
