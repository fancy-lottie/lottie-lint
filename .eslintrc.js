module.exports = {
  extends: 'eslint-config-egg',
  parserOptions: {
    project: './tsconfig.eslint.json',
    sourceType: 'module',
    createDefaultProgram: true,
  },
  rules: {
    radix: 'off',
    semi: 'off',
    camelcase: 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': 'warn',
    'array-bracket-spacing': 'warn',
    '@typescript-eslint/adjacent-overload-signatures': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/member-ordering': 'off',
    'no-underscore-dangle': 'off',
    'id-blacklist': 'off',
    'id-match': 'off',
    'import/order': 'off',
  },
  globals: {
    window: true,
    document: true,
    Image: true,
  },
}

