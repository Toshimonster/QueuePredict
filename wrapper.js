module.exports = (argv) => {

    if (argv.verbose) {
        console.verbose = (...args) => {
            console.log.apply(this, args)
        }
    } else {
        console.verbose = () => {}
    }

    console.verbose("Wrapper initialized")
}