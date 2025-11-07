import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Browser APIs
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        IntersectionObserver: 'readonly',
        performance: 'readonly',
        // Three.js (if used)
        THREE: 'readonly',
        // Service Worker globals
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      // Console warnings (allowed in development, removed in production build)
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

      // Variable declarations
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Code quality
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',

      // Best practices
      eqeqeq: ['error', 'always'],
      curly: ['warn', 'all'], // Changed to warn since many files use single-line if statements
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-useless-escape': 'warn',

      // Style (handled by Prettier, but good to have)
      semi: ['error', 'always'],
      // Disable quote and comma-dangle rules since Prettier handles them
      quotes: 'off',
      'comma-dangle': 'off',
    },
  },
];
