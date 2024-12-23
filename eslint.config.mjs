// eslint.config.mjs
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'


export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.warnings,
  importPlugin.flatConfigs.typescript,
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '.github',
      '**/*.{js,mjs,cjs}',
      'tests',
      '.old_src',
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json', // Path to your ESLint-specific tsconfig
        tsconfigRootDir: import.meta.dirname,        // Ensure this points to the project root
        sourceType: 'module',
        projectService: true
      },
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser,
        ...globals.webextensions
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      perfectionist,
      // yenz,
      // jest,
      '@stylistic': stylistic
      // tseslint
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
      // 'yenz/type-ordering': 'error',
      // 'yenz/no-loops': 'error',
      'dot-notation': 'error',
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-case-declarations': 'off',
      'no-console': ['error', {allow: ['error', 'warn']}],
      'no-magic-numbers': ['error', {
        ignoreArrayIndexes: true,
        ignore: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
      '@typescript-eslint/explicit-function-return-type': 'off',
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
        argsIgnorePattern: '^_$'
      }],
      'padding-line-between-statements': ['error', {
        blankLine: 'always',
        prev: 'function',
        next: '*'
      }, {
        blankLine: 'always',
        prev: '*',
        next: 'function'
      }],
      'import/no-named-as-default': 'off',
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'pathGroups': [{
          pattern: '@sx/**',
          group: 'internal'
        }],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true
        }
      }],
      'import/newline-after-import': ['error', {
        count: 2
      }]
    }
  }
)
