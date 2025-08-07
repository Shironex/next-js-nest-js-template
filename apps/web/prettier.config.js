/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  $schema: 'https://json.schemastore.org/prettierrc',
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  bracketSpacing: true,
  tabWidth: 2,
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
