module.exports = {
  // Run ESLint on JS, JSX, TS, and TSX files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // Run Prettier on other file types
  '**/*.{css,scss,json,md,mdx,html}': ['prettier --write'],

  // Specific handling for package.json
  'package.json': ['prettier --write'],
};
