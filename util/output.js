
const output = {
  error: function (msg) {
    console.log("\033[41;30m Error \033[0;31m " + msg + " \033[0m")
  },
  success: function (msg) {
    console.log("\033[42;30m Success \033[0;32m " + msg + " \033[0m")
  },
  warn: function (msg) {
    console.log("\033[43;30m Warn \033[0;33m " + msg + " \033[0m")
  },
  printLink: function (link) {
    console.log("\033[32m Link: \033[32m" + link + "\033[0m")
  }
}

module.exports = output