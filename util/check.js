const Keys = require('./constants')
const output = require('./output')

module.exports = function (envConfig) {
  let sure = []
  for (let i = 0, len = Keys.length; i < len; i++) {
    let key = Keys[i]
    if (!(key in envConfig)) {
      output.error(`Error: > not found ${key} in .env file`)
      break
    }
    if (envConfig[key] === '') {
      output.error(`Error: > not set value of ${key} in .env file`)
      break
    }
    sure.push(1)
  }
  return sure.length === Keys.length
}