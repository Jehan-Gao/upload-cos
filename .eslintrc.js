module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: 'standard',
  rules: {
    eqeqeq: [0],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-tabs': 'off',
    'space-before-function-paren': 0,
    // 'no-undef': 0,
    'standard/no-callback-literal': 0,
    'handle-callback-err': 0,
  },
}
