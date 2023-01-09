module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-undef': 'error',
  },
};
