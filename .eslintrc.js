module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'plugin:security/recommended',  // セキュリティルール追加
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'vue', 'security'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // Vue specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits'],
    }],
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'always'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 3 },
      multiline: { max: 1 }
    }],
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'error',
    'vue/require-prop-types': 'error',
    'vue/v-bind-style': ['error', 'shorthand'],
    'vue/v-on-style': ['error', 'shorthand'],

    // General ESLint rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': 'off', // Handled by TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'quote-props': ['error', 'as-needed'],
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'error',
    'array-callback-return': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'prefer-regex-literals': 'error',

    // Code style rules
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],

    // Import rules
    'sort-imports': ['error', {
      ignoreCase: false,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    }],

    // === 1人運営向け追加品質ルール ===
    
    // セキュリティ強化
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    
    // TypeScript 厳格化
    '@typescript-eslint/no-magic-numbers': ['warn', { 
      ignore: [-1, 0, 1, 2, 10, 100, 1000],
      ignoreEnums: true,
      ignoreNumericLiteralTypes: true 
    }],
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    
    // パフォーマンス最適化
    'no-await-in-loop': 'warn',
    'prefer-promise-reject-errors': 'error',
    'require-atomic-updates': 'error',
    
    // コード品質向上
    'complexity': ['warn', 10],  // 複雑度制限
    'max-depth': ['warn', 4],   // ネスト制限
    'max-lines-per-function': ['warn', 50], // 関数行数制限
    'no-nested-ternary': 'error', // ネスト三項演算子禁止
    'prefer-template': 'error',   // テンプレートリテラル推奨
  },
  overrides: [
    // Frontend specific configuration
    {
      files: ['frontend/**/*.{ts,vue}'],
      env: {
        browser: true,
        node: false,
      },
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
      rules: {
        'no-undef': 'off', // TypeScript handles this
      },
    },
    // Backend specific configuration
    {
      files: ['functions/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off', // Allow console in backend
      },
    },
    // Test files configuration
    {
      files: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}', '**/cypress/**/*.{ts,js}'],
      env: {
        jest: true,
        'cypress/globals': true,
      },
      extends: ['plugin:cypress/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    // Configuration files
    {
      files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
    // Vue files specific rules
    {
      files: ['*.vue'],
      rules: {
        'indent': 'off', // Conflicts with vue/script-indent
        'vue/script-indent': ['error', 2, {
          baseIndent: 0,
          switchCase: 1,
        }],
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'lib/',
    'node_modules/',
    'coverage/',
    '*.min.js',
    'firebase-debug.log',
    'firestore-debug.log',
    'ui-debug.log',
  ],
};