'use strict';

const readlineSync = require('readline-sync');
const chalk = require('chalk');
const cfnLint = require('cfn-lint');
const cfnParser = require('cfn-lint/lib/parser');
const fs = require('fs');
const log = console.log;

module.exports = {
    execute: userInput
}

const themes = {
    heading: chalk.bold.underline.blue,
    subheading: chalk.bold
};

function userInput(filename, flags) {
    // run a pre-validation test on the CFN template before asking for parameters, no sense wasting time if the template isn't valid
    if(!flags.nolint) {
        const preValidationTest = cfnLint.validateFile(filename);
        if (!preValidationTest.templateValid) {
            throw new Error(`${filename} is not a valid CFN template. Errors: ${preValidationTest.errors}`);
        }
    }

    // load template and parse Parameters
    const cfnTemplate = cfnParser.openFile(filename);

    // for each parameter get user input
    let parameterMap = getParameterInputs(cfnTemplate.Parameters);

    // write output
    if(flags.output === undefined) {
        writeOutput(readlineSync.question('Output filename: '), parameterMap);
    } else {
        writeOutput(flags.output, parameterMap);
    }
}

function getParameterInputs(parameters) {
    let parameterMap = new Map();
    Object.keys(parameters).forEach((parameterName) => {
        let userInput = getValueInput(parameterName, parameters[parameterName]);
        while(!nullOrBlank(userInput)) {
            if(readlineSync.keyInYNStrict('This Parameter is Required. Do you wish to exit this script?')) {
                process.exit(0);
            }
            userInput = getValueInput(parameterName, parameters[parameterName]);
        }

        parameterMap.set(parameterName, userInput);
    });
    return parameterMap;
}

/**
 * Get input from the console for a given parameter.
 */
function getValueInput(parameterName, parameterDetails) {
    log(themes.heading(`${parameterName}`));
    log(themes.subheading(`Type:`), parameterDetails.Type);

    // Print each Key/Value
    const optionalValues = Object.keys(parameterDetails).filter(word => word != 'Type');
    optionalValues.forEach((value) => {
        log(themes.subheading(`${value}:`), parameterDetails[value]);
    });

    let noEcho = parameterDetails.hasOwnProperty('NoEcho');
    let defaultValue = parameterDetails.hasOwnProperty('Default') ? parameterDetails.Default : null;

    let inputtedValue = readlineSync.question(defaultValue ? `[${defaultValue}]: ` : '[]: ', {
        hideEchoBack: noEcho
    });
    inputtedValue = !inputtedValue ? defaultValue : inputtedValue;

    log('');

    return inputtedValue;
}

function writeOutput(filename, parameters) {
    log("\nWriting output to:", chalk.bold(filename));

    let jsonResults = [];
    parameters.forEach((value, key) => {
        jsonResults.push({
            ParameterKey: key,
            ParameterValue: value
        });
    });

    fs.writeFileSync(filename, JSON.stringify(jsonResults, null, 2), 'utf-8');
}

function nullOrBlank(value) {
    if(!value)
        return false;

    if(!value.length)
        return false;

    return true;
}
