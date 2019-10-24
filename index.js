// Command line parsing middleware
const yargs = require("yargs")

yargs
    .command('pd', 'Parses the data in ./Data Set and resolves for useful infomation', require("./pd"))
    .command('trainingTest', 'Generates random training data to train a network for a 3-way NOR gate.', require("./trainTest"))
    .command('getData', 'Gets data to save into a file, to then be trained.', require("./getData"))
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: "Enables verbose logs"
    })
    .option('save', {
        alias: 's',
        type: 'boolean',
        description: "Saves parsed data into a file"
    })
    .option('load', {
        alias: 'l',
        type: 'boolean',
        description: "Skips parsing of data and loads previous data"
    })
    .conflicts('save', 'load')
    .help('help')
    .alias('help', 'h')
    .epilog('Toshimonster 2019')
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .argv