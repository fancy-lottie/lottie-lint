module.exports = {
  extends: 'eslint-config-egg',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'jsdoc/require-example': [
        'off',
        {
          avoidExampleOnConstructors: true,
          exemptedBy: ['type']
        }
    ]
  }
};
