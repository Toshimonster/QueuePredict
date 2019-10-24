//Parse Data

const xlsx = require("js-xlsx")
const path = require("path")
const fs = require("fs")
const cliProgress = require("cli-progress")

class DataSet {
    //Used to contain the large data set
    constructor() {
        this.attractions = {}
        this.times = new Map()
    }

    persist() {

        // backup
        if (fs.existsSync(path.join(__dirname, "./Persist/DataSet"))) {
            console.dir("Moved Dataset to Dataset.backup")
            fs.renameSync(path.join(__dirname, "./Persist/DataSet"), path.join(__dirname, "./Persist/DataSet.backup"))
        }

        let copy = this.attractions

        // Allow maps to be stringified
        Object.keys(copy).forEach((key) => {
            copy[key] = Array.from(copy[key])
        })

        let data = JSON.stringify(this.attractions)

        fs.writeFileSync(path.join(__dirname, "./Persist/DataSet"), data)
        console.verbose("Persisted Data Set")
        return true
    }

    load() {
        let data = fs.readFileSync(path.join(__dirname, "./Persist/DataSet")).toString("UTF-8")
        console.verbose("Read data, parsing.")
        data = JSON.parse(data)

        let bar1 = new cliProgress.Bar({
            format: "Loading Data {bar} {percentage}% | {value}/{total} | {duration_formatted}",
            hideCursor: true
        }, cliProgress.Presets.shades_classic);
        let barIncrementer = Object.values(data)[0].length
        bar1.start(Object.keys(data).length * barIncrementer, 0)

        Object.keys(data).forEach((key, index) => {

            data[key].forEach((timecodeArr, index) => {
                bar1.increment(1)
                data[key][index][0] = new Date(timecodeArr[0])
            })

            bar1.update(barIncrementer * (index + 1))
            data[key] = new Map(data[key])
        })
        bar1.update(Object.keys(data).length * barIncrementer)
        bar1.stop()

        this.attractions = data

        console.verbose("Loaded Data Set")
        return true
    }

    sheetToArr(sheet) {
        //Gets an array from a XLSX sheet
        let result = [];
        let row;
        let rowNum;
        let colNum;
        let range = xlsx.utils.decode_range(sheet['!ref'])
        //From the sheets reference metadata, iterate through its range.
        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            //For each row
            row = [];
            for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
                //For each column
                var nextCell = sheet[
                    xlsx.utils.encode_cell({
                        r: rowNum,
                        c: colNum
                    })
                ];
                if (typeof nextCell === 'undefined') {
                    //If cell is null
                    row.push(void 0);
                } else row.push(nextCell.w);
            }
            result.push(row);
        }
        console.verbose("Split into array")
        return result
    }

    addArr(arr) {

        //Adds an array like sheet structure into the data structure.
        let headers = arr[0]
        arr = arr.slice(1)

        arr.forEach((value) => {
            let time = new Date(value[0]) //Parse date

            value.forEach((wait, index) => {
                if (wait) { //only if wait exists; if data isnt there its pointless and a waste of memory.

                    if (!this.attractions[headers[index]]) {
                        // Attraction dosent exist; initialize it
                        console.verbose(`Adding attraction ${headers[index]}`)
                        this.attractions[headers[index]] = new Map()
                    }

                    // Add to attractions map
                    this.attractions[headers[index]].set(time, wait)
                }
            })
        })
    }

    addSheet(sheet) {
        return this.addArr(this.sheetToArr(sheet))
    }

    sigmoid(value) {
        return (1 / (1 + Math.exp(-value)))
    }


    buisinessFromArr(arr) {
        let buisiness = 0
        arr.forEach((key) => {
            let val = key.wait
            if (!isNaN(val)) {
                buisiness += Number(val)
            } else {
                console.verbose(`Ignoring exteranous value of "${val}"; please investigate.`)
            }
        })
        return buisiness / arr.length
    }

    getWaitComparison(startDate = new Date("0000"), endDate = new Date("9999"), arr = null, day = -1, removeZero = true) {
        /* Input arr:
            [
                {
                    time: time,
                    attraction: attraction,
                    wait: wait
                }
            ]getWaitCompa
        */

        if (arr === null) {
            arr = []
            console.verbose("Constructing array for getWaitComparison")
            Object.keys(this.attractions).forEach((key) => {
                this.attractions[key].forEach((wait, time) => {
                    arr.push({
                        time: time,
                        attraction: key,
                        wait: wait
                    })
                })
            })
            console.verbose("Array Constructed")
        }
        console.log(arr.length)
        console.log(arr[123])
        console.log(arr[123].time.getDay())

        return arr.filter((value) => {
            if (value.time >= startDate && value.time <= endDate) {
                if (day == -1 || value.time.getDay() == day) {
                    if (!removeZero || value.wait != 0) {
                        return true
                    }
                }
            }
            return false
        })
    }
}



function parseData() {
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

    console.verbose(`Found: \n\t${files.join("\n\t")}`)

    console.verbose("Combining into a singular data structure")

    let data = new DataSet()

    let bar1 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length * 2, 0)

    files.forEach((file) => {
        //Iterate through all data sheets
        console.verbose(`Parsing ${file}:`)
        let workbook = xlsx.readFile(path.join(__dirname, "Data Set", file))
        console.verbose("Parsed XLSX")
        bar1.increment(1)
        data.addSheet(workbook.Sheets["Sheet1"])
        bar1.increment(1)
        console.verbose(`\nFormatting complete; Attraction size is now ${Object.keys(data.attractions).length}`)
    })
    bar1.stop()
    console.log(`Formatting complete, computed ${Object.keys(data.attractions).length} attractions`)

    return data
}

function loadData() {
    let data = new DataSet()
    data.load()
    return data
}

//Launched when index.js is run with the pd command.
module.exports = (argv) => {
    require("./wrapper")(argv.argv)

    console.verbose("Starting pd.js")

    let data = null

    if (argv.argv.load) {
        console.verbose("Loading data")
        data = loadData()
    } else {
        console.verbose("Parsing data")
        data = parseData()
        if (argv.argv.save) {
            console.verbose("Persisting data")
            data.persist()
        }
    }

    console.log(data)

    //

    // Buisiness for times of the week
    /*
    let results = []
    void [1,2,3,4,5,6,0].forEach((day) => {
        let sample = data.getWaitComparison(new Date("0000"), new Date("9999"), null, day)
        results.push(data.buisinessFromArr(sample))
    });

    results.forEach((value, index) => {
        console.log(`${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satuday", "Sunday"][index]} | ${value}`)
    })
    */




    //Getting multivariable data

    //Data goes from May 2017 to May 2019.
    // x = day
    // y = week number
    // z = buisiness
    // [x,y,z]

    let positions = []
    let tempDate = new Date("May 2017")
    let endDate = new Date("June 2019") //Add one month
    let weekIterator = 1

    while (tempDate <= endDate) {

        let copyDate = tempDate
        copyDate.setDate(tempDate.getDate() + 7) //Add a week

        void[1, 2, 3, 4, 5, 6, 0].forEach((day) => {
            let sample = data.getWaitComparison(tempDate, copyDate, null, day)
            console.log(tempDate)
            if (sample.length != 0) {
                positions.push([day, weekIterator, data.buisinessFromArr(sample)])
            } else {
                console.verbose(sample)
            }
            console.verbose(positions)
        });

        weekIterator += 1
        tempDate = copyDate
    }

    fs.writeFileSync("Persist/positions.json", JSON.stringify(positions))







    /*
    let dayAverages = []

    for (let day in [1,2,3,4,5,6,0]) {

        let summed = []

        //Slice headers from data array, and filter each date so the day is correct.
        let dayData = data.slice(1).filter((value) => (new Date(value[0]).getDay() == day))

        console.verbose(`Found ${dayData.length} instances where the day is ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satuday"][day]}`)

        dayData.forEach((value) => {
            value.slice(1).forEach((time, index) => {
                //Increment summed array
                summed[index] = summed[index] + Number(time) || Number(time)
            })
        })

        console.verbose(`Summed instances`)
        
    }
    let averages = []

    summed.forEach((value, index) => {
        console.verbose(value)
        averages[index] = value / dayData.length
    })

    console.log(averages)
    */



}