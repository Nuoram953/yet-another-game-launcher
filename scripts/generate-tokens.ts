import fs from "fs";
import path from "path";

const TOKENS_PATH = path.resolve("design-tokens.json");
const OUTPUT_CSS = path.resolve("src/renderer/design-tokens.css");
const OUTPUT_TAILWIND = path.resolve("tailwind.tokens.js");

type AnyObject = Record<string, any>;

// Load JSON tokens
const tokens: AnyObject = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));

// -----------------------
// Helper: resolve references
// -----------------------
function getValueByPath(obj: AnyObject, pathStr: string): any {
  const parts = pathStr.split(".");
  let current: any = obj;

  for (const p of parts) {
    if (current == null) {
      throw new Error(`Token path not found: ${pathStr}`);
    }
    current = current[p];
  }
  return current;
}

function resolveReferences(value: string, obj: AnyObject): string {
  const refRegex = /\{([^}]+)\}/g;
  return value.replace(refRegex, (_, refPath) => {
    const resolved = getValueByPath(obj, refPath.trim());
    if (typeof resolved !== "string") {
      throw new Error(`Token reference did not resolve to string: {${refPath}}`);
    }
    return resolved;
  });
}

// -----------------------
// Flatten JSON to CSS variables
// -----------------------
function flatten(obj: AnyObject, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === "string") {
      result[newKey] = value.includes("{") ? resolveReferences(value, tokens) : value;
    } else if (typeof value === "object") {
      Object.assign(result, flatten(value, newKey));
    }
  }

  return result;
}

function generateCssVars(flat: Record<string, string>) {
  const lines = Object.entries(flat).map(([key, value]) => `  --${key}: ${value};`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}

// -----------------------
// Generate Tailwind JS
// -----------------------
function generateTailwindConfig(tokens: AnyObject) {
  const textColors = Object.fromEntries(
    Object.keys(tokens.color.semantic.text).map((key) => [key, `var(--color-semantic-text-${key})`]),
  );

  const backgroundColors = Object.fromEntries(
    Object.keys(tokens.color.semantic.background).map((key) => [key, `var(--color-semantic-background-${key})`]),
  );

  const borderColors = Object.fromEntries(
    Object.keys(tokens.color.semantic.border || {}).map((key) => [key, `var(--color-semantic-border-${key})`]),
  );

  return `export default {
  textColor: ${JSON.stringify(textColors, null, 2)},
  backgroundColor: ${JSON.stringify(backgroundColors, null, 2)},
  borderColor: ${JSON.stringify(borderColors, null, 2)}
};`;
}

// -----------------------
// Run
// -----------------------
//
const flat = flatten(tokens);
const css = generateCssVars(flat);
const tailwindJs = generateTailwindConfig(tokens);

fs.mkdirSync(path.dirname(OUTPUT_CSS), { recursive: true });
fs.writeFileSync(OUTPUT_CSS, css, "utf-8");
fs.writeFileSync(OUTPUT_TAILWIND, tailwindJs, "utf-8");

console.log("✅ Tokens generated:");
console.log(`- CSS: ${OUTPUT_CSS}`);
console.log(`- Tailwind config: ${OUTPUT_TAILWIND}`);
