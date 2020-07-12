const { ENV_KEYS } = require('./constants')
const output = require('./output')

module.exports = function (envConfig) {
  const sure = []
  for (let i = 0, len = ENV_KEYS.length; i < len; i++) {
    const key = ENV_KEYS[i]
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
  return sure.length === ENV_KEYS.length
}
