#!/usr/bin/env node
'use strict';

const meow = require('meow');
const readline = require('readline');
const api = require('./api.js');
const fs = require('fs');
const prettyerror = require('pretty-error');

const EXIT_CODES = {

}

const cli = meow(`
	Usage
	  $ cfn-build-parameters <template_file>

	Options
	  --output, -o     Output filename
	  --nolint         Skip cfn-lint testing

	Examples
	  $ cfn-build-parameters mytemplate.yaml -o output.json
`, {
	flags: {
		output: {
			type: 'string',
			alias: 'o'
		},
		nolint: {
			type: 'boolean'
		}
	}
});

const path = cli.input[0];
const flags = cli.flags;

if (path === undefined) {
    cli.showHelp(1);
}

if (!fs.existsSync(path)) {
    console.log(`ERROR: ${path} not found.`);
    cli.showHelp(2);
}

try {
	api.execute(path, flags);
}
catch (error) {
	let pe = new prettyerror();
	let renderedError = pe.render(new Error(error));
	console.log(renderedError);
}
