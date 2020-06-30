#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const start = require('../index')
const {version} = require('../package.json')

if (argv.h || argv.help) {
  console.log([
		'usage: cos-upload [options]',
		'',
		'options:',
		'  -d           Directory to upload.',
		'  -f           File to upload.',
		'  -m --mode    read .env.${mode} file',
		'  -h --help    Print this list and exit.',
		'  -v           Print version.'
		].join('\n'))
  process.exit()
} else if (argv.v) {
	console.log(`v${version}`)
} else {
	start(argv)
}

