import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "extract_headers.js",
    "inspect_excel.js",
    "inspect_excel_to_json.js",
    "source/**",
    // Backend ingestion scripts (Node.js, not part of the app):
    "src/lib/ingestion/**",
  ]),
  // Project-level rule overrides:
  {
    rules: {
      // Downgrade to warning — `any` is often unavoidable with external data (Excel, Firestore)
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgrade unused vars to warning to avoid build failures during development
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
]);

export default eslintConfig;
