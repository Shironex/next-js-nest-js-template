import { nextJsConfig } from '@workspace/eslint-config/next-js'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'

const eslintConfig = [
  ...nextJsConfig,
  {
    plugins: {
      prettier: pluginPrettier,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'all',
          semi: false,
          tabWidth: 2,
          singleQuote: true,
          printWidth: 80,
          endOfLine: 'auto',
          arrowParens: 'always',
          plugins: ['prettier-plugin-tailwindcss'],
        },
        {
          usePrettierrc: false,
        },
      ],
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
    },
  },
]

export default eslintConfig
