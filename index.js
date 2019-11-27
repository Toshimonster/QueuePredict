// Command line parsing middleware
const yargs = require("yargs")

yargs
    .command('server', 'Runs the program in server mode, applying everything into an api', require("./api/index"))
    .command('train <ride> [batchSize] [epochs]', 'Trains data in ./FormattedData into a Model in ./Models', require("./tfDatabase"))
    .command('getData <ride>', 'Gets data to save into a file, to then be trained.', require("./getData"))
    .command('getRides', 'Gives all available rides to train, and saves them into ./AllRides.txt', require("./getRideNames"))
    .command('trainingTest', 'Generates random training data to train a network for a 3-way NOR gate.', require("./trainTest"))
    .command('pd', 'Parses the data in ./Data Set and resolves for useful infomation', require("./pd"))
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