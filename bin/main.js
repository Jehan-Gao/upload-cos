#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const start = require('../index')
const {version} = require('../package.json')

if (argv.h || argv.help) {
  console.log([
		'usage: cos-upload [options]',
		'',
		'options:',
		' [-d Directory]        Directory to upload.',
		' [-f File]             File to upload.',
		' [-o Output]           Output to the cos directory',
		' [-m Mode]             Read .env.${Mode} file',
		' -h --help             Print this list and exit.',
		' [-v Version]          Print version.'
		].join('\n'))
  process.exit()
} else if (argv.v) {
	console.log(`v${version}`)
} else {
	start(argv)
}

