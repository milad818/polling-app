// @ts-check

/**
 * ESLint flat config for an Angular 21 project.
 *
 * Flat config (eslint.config.mjs) is the format ESLint v9+ requires.
 * It is a single JS file that exports an array of config objects —
 * no more cascading .eslintrc files spread across the directory tree.
 *
 * Three layers are applied here:
 *   1.  TypeScript files  – base JS rules + typescript-eslint + Angular-specific TS rules
 *   2.  HTML templates    – Angular template parser + angular-eslint template rules
 *   3.  Prettier override – turns OFF every ESLint rule that would conflict with
 *                          Prettier's formatting (must be last so it wins).
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ─── Files / directories ESLint should never touch ───────────────────────
  {
    ignores: [
      'dist/**',       // production build output
      '.angular/**',   // Angular CLI cache
      'node_modules/**',
      'coverage/**',
    ],
  },

  // ─── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    extends: [
      // ESLint core rules (no-unused-vars, no-undef, …)
      eslint.configs.recommended,

      // typescript-eslint recommended + stylistic type-aware rules.
      // "recommended"  = correctness rules (no-explicit-any, no-floating-promises, …)
      // "stylistic"    = code-style rules (prefer-nullish-coalescing, prefer-optional-chain, …)
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,

      // Angular TS rules: enforces Angular best practices
      // (OnPush detection strategy, proper lifecycle hooks, no direct DOM access, …)
      ...angular.configs.tsRecommended,
    ],

    // Extracts inline templates from @Component({ template: `…` }) so ESLint
    // can also lint those snippets through the HTML template rules below.
    processor: angular.processInlineTemplates,

    rules: {
      // Selectors must follow the project's "app" prefix.
      // Directive selectors: attribute style, camelCase  →  [appHighlight]
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      // Component selectors: element style, kebab-case  →  <app-profile />
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // By convention, parameters / variables prefixed with _ are intentionally
      // unused (e.g. destructuring to discard a field, interface-required params).
      // Treat them as non-errors rather than forcing awkward workarounds.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ─── Angular HTML template files ─────────────────────────────────────────
  {
    files: ['**/*.html'],
    extends: [
      // Recommended template rules: missing async pipe, trackBy in @for, …
      ...angular.configs.templateRecommended,

      // Accessibility rules: interactive elements need ARIA labels, etc.
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },

  // ─── Prettier must be last ────────────────────────────────────────────────
  // eslint-config-prettier exports a flat config object that sets every
  // formatting-related rule (indent, quotes, semicolons, max-len, …) to "off".
  // This prevents ESLint from reporting style issues that Prettier already handles,
  // so the two tools never fight each other.
  prettierConfig,
);
