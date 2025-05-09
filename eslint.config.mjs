import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import _import from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import perfectionist from 'eslint-plugin-perfectionist'
import yenz from 'eslint-plugin-yenz'
import globals from 'globals'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [...fixupConfigRules(compat.extends(
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-type-checked',
  'plugin:import/warnings',
  'plugin:import/typescript',
  'plugin:jest/recommended',
  'plugin:@stylistic/recommended-extends',
)), {
  plugins: {
    '@typescript-eslint': fixupPluginRules(typescriptEslint),
    '@stylistic': fixupPluginRules(stylistic),
    'perfectionist': fixupPluginRules(perfectionist),
    'import': fixupPluginRules(_import),
    yenz,
    'jest': fixupPluginRules(jest),
  },

  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.node,
      ...globals.browser,
      ...globals.webextensions,
    },

    parser: tsParser,
    ecmaVersion: 2020,
    sourceType: 'module',

    parserOptions: {
      project: './tsconfig.json',
    },
  },

  rules: {
    'yenz/type-ordering': 'error',
    'yenz/no-loops': 'error',
    'dot-notation': 'error',
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'no-case-declarations': 'off',

    'no-console': ['error', {
      allow: ['error', 'warn'],
    }],

    'no-magic-numbers': ['error', {
      ignoreArrayIndexes: true,
      ignore: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }],

    'no-use-before-define': 'off',
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'brace-style': ['error', 'stroustrup'],
    'perfectionist/sort-enums': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-union-types': 'off',
    'perfectionist/sort-classes': 'off',
    'perfectionist/sort-interfaces': 'off',
    'perfectionist/sort-objects': 'off',
    'perfectionist/sort-object-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/prefer-find': 'error',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@stylistic/no-multiple-empty-lines': 'off',
    '@stylistic/comma-dangle': 'off',
    '@stylistic/indent': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',

    '@typescript-eslint/no-unused-vars': ['error', {
      varsIgnorePattern: '^_$',
      argsIgnorePattern: '^_$',
    }],

    'padding-line-between-statements': ['error', {
      blankLine: 'always',
      prev: 'function',
      next: '*',
    }, {
      blankLine: 'always',
      prev: '*',
      next: 'function',
    }],

    'import/no-named-as-default': 'off',

    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],

      'pathGroups': [{
        pattern: '@sx/**',
        group: 'internal',
      }],

      'pathGroupsExcludedImportTypes': ['builtin'],
      'newlines-between': 'always',

      'alphabetize': {
        order: 'asc',
        caseInsensitive: true,
      },
    }],

    'import/newline-after-import': ['error', {
      count: 2,
    }],
  },
}, {
  files: ['**/*.test.*'],

  rules: {
    'no-magic-numbers': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
}, {
  // UI Components are copied from shadcn/ui and are not linted
  ignores: ['src/react/client/components/ui/**'],
}]
