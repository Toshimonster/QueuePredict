module.exports = (argv, datasets=999) => {
    //require("./wrapper")(argv.argv)
    console.verbose = (args) => {console.log(args)}
    const fs = require("fs")
    const path = require("path")
    const xlsx = require("js-xlsx")

    let files = fs.readdirSync(path.join(__dirname, "Data Set"))

    console.verbose(`Found files, sanitizing...`)

    //If file name ends with xlsx
    files = files.filter((file) => RegExp(/\.(xlsx)$/i).test(file))

    console.verbose(`Sorting...`)
    //Sort before parsing to not have to sort every data item when extracted

    files = files.sort((a, b) => {
        //Slice to get timestamp from filename
        let timeA = new Date(a.slice(0, 8))
        let timeB = new Date(b.slice(0, 8))
        if (timeA < timeB) {
            return -1;
        }
        if (timeA > timeB) {
            return 1;
        }

        //Dates must be equal
        return 0;
    })

    files.splice(datasets)

    let data = {}

    console.verbose(`Found: \n\t${files.join("\n\t")}`)
    files.forEach((file) => {
        let workbook = xlsx.readFile(path.join(__dirname, "Data Set", file), {sheetRows: 2})
        let sheetData = xlsx.utils.sheet_to_json(workbook.Sheets["Sheet1"])
        Object.keys(sheetData[0]).forEach(name => {
            if (/\S/.test(name)) {
                if (data[name]) {
                    data[name] += 1
                } else {
                    data[name] = 1
                }
                console.verbose(`Found ${name} now ${data[name]} time(s)`)
            }
        })
    })

    console.verbose(`Writing to "./AllRides.txt"`)
    console.verbose(data)

    fs.writeFileSync("./AllRides.txt", JSON.stringify(data))
}