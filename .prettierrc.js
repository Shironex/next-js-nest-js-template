/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  $schema: 'https://json.schemastore.org/prettierrc',
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  bracketSpacing: true,
  tabWidth: 2,
  printWidth: 100,
  endOfLine: 'auto',
  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
