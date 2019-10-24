const xlsx = require("js-xlsx")
const path = require("path")
const fs = require("fs")

console.verbose = (...args) => {console.log.apply(this, args)}

module.exports = (attraction = 'Big Thunder Mountain Railroad', datasets = 999) => {
    //Default Big Thunder Mountain
    const ATTRACTION = attraction

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

    let data = []

    console.verbose(`Found: \n\t${files.join("\n\t")}`)
    files.forEach((file) => {
        //Iterate through all data sheets
        console.verbose(`Parsing ${file}:`)
        let workbook = xlsx.readFile(path.join(__dirname, "Data Set", file))
        console.verbose("Parsed XLSX")
        let json = xlsx.utils.sheet_to_json(workbook.Sheets["Sheet1"])
        console.verbose(json[0][' '])
        data.push(json)
    })
    /*Json is in the format
    {
        " ": {TIME eg:2017-05-17 16:20:00 +0000}
        {Ride Name}: {Wait time}
    }
    */
    //To return: we need to satisfy the assumption of:
    //Assuming data[i] wait, year, month, day, hour and minute variables.
    let dataToReturn = []
    data.forEach((dataSet) => {
        dataSet.forEach((set) => {
            //console.log(set)
            let date = new Date(set[" "])
            let toAppend = {
                wait: set[ATTRACTION],
                year: date.getYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes()
            }
            //Ensure that wait exists.
            if (toAppend.wait) dataToReturn.push(toAppend);
        })
    })

    return dataToReturn
}

//module.exports()