/**
 * File to run plato static analyser.
 *
 * */

const plato = require('plato');

const files = [
    'src/**/**/**.js'
];
const outputDir = './Reports/Plato';
// null options for this example
const options = {
    title: 'Project allocation tool',
    eslint: {}
};

let callback = function (report) {
    console.log("Running plato checks.")
};

plato.inspect(files, outputDir, options, callback);