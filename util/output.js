
const output = {
  error: function (msg) {
    console.log("\033[41;37m " + msg + " \033[0m")
  },
  success: function (msg) {
    console.log("\033[42;37m " + msg + " \033[0m")
  },
  warn: function (msg) {
    console.log("\033[43;30m " + msg + " \033[0m")
  }
}

module.exports = output