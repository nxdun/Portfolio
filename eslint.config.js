import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*/*/**",
                "!@/features/*/components/**",
                "!@/features/*/data/**",
              ],
              message:
                "Deep imports into feature internals are forbidden. Import from the feature's root index.ts instead. Astro components and JSON data are exempted.",
            },
          ],
        },
      ],
    },
  },
  { ignores: ["dist/**", ".astro", "public/pagefind/**"] },
];
