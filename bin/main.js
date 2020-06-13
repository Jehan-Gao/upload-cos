#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
console.log(argv)

if (argv.h || argv.help) {
  console.log([
		'usage: cos-upload [options]',
		'',
		'options:',
		'  -d           Directory to upload',
		'  -f           File to upload',
		'  -h --help    Print this list and exit.'
		].join('\n'))
  process.exit()
}


