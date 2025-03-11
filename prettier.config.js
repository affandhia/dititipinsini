// prettier.config.js
module.exports = {
  // General settings
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false, // Previously known as jsxBracketSameLine
  arrowParens: 'always',

  // End of line and parser settings
  endOfLine: 'lf',

  // Plugin configuration
  // plugins: ['prettier-plugin-tailwindcss'],

  // Tailwind specific settings
  // tailwindConfig: './tailwind.config.js',

  // Overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
};
