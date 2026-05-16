import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      'dist',
      'build',
      'coverage',
      '.cache',
      'node_modules',
      'public',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/V2/**/*.{js,jsx}'],
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['warn', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'react/prop-types': 'off',
    },
  },
  {
    files: [
      'src/V2/features/**/*.{js,jsx}',
      'src/V2/services/**/*.{js,jsx}',
      'src/V2/shared/**/*.{js,jsx}',
      'src/V2/theme/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../Admin/*',
                '../../Admin/*',
                '../../../Admin/*',
                '../../../../Admin/*',
                '../Staff/*',
                '../../Staff/*',
                '../../../Staff/*',
                '../../../../Staff/*',
                '../TechAdmin/*',
                '../../TechAdmin/*',
                '../../../TechAdmin/*',
                '../../../../TechAdmin/*',
                '../User/*',
                '../../User/*',
                '../../../User/*',
                '../../../../User/*',
                '../common/*',
                '../../common/*',
                '../../../common/*',
                '../../../../common/*',
                '../utils/*',
                '../../utils/*',
                '../../../utils/*',
                '../../../../utils/*',
              ],
              message:
                'V2 feature, service, shared, and theme code must use V2-owned modules instead of v1 folders.',
            },
          ],
        },
      ],
    },
  },
]
