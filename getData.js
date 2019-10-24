const fs = require("fs")

class Weather {

    constructor(file, startDate) {
        this.file = file
        this.startDate = startDate
        this.data = new Map()
    }

    padLeft(str, length=2) {
        str = str.toString()
        return ("0000".substring(0, length - str.length) + str)
    }

    parse() {
        this.data = new Map()
        let raw = fs.readFileSync(this.file).toString()
        let datasets = raw.split("\n")
        datasets.forEach((dataset) => {
            let temp = dataset.split(",")
            this.data.set(temp[0] + " " + temp[1], temp.splice(2))
        })
    }

    getData(time) {
        //Gets data closest to the time
        let t = new Date(time)
        for (let index = 0; index < 168; index++) {
            //Repeat for the hours of the week
            //console.log(this.data.keys())
            //console.log(this.padLeft(t.getMonth()+1))
            //console.log(`${t.getFullYear()}-${this.padLeft(t.getMonth()+1)}-${this.padLeft(t.getDate())} ${this.padLeft(t.getHours())}:${this.padLeft(t.getMinutes())}`)
            if (this.data.has(`${t.getFullYear()}-${this.padLeft(t.getMonth()+1)}-${this.padLeft(t.getDate())} ${this.padLeft(t.getHours())}:${this.padLeft(t.getMinutes())}`)) {
                return this.data.get(`${t.getFullYear()}-${this.padLeft(t.getMonth()+1)}-${this.padLeft(t.getDate())} ${this.padLeft(t.getHours())}:${this.padLeft(t.getMinutes())}`)
            } else {
                //Go forward an hour
                t.setTime(t.getTime() + 60*60*1000)
            }
        }
        //Bad iteration
        return false
    }

    getFunctionalData(time, temp=true, precipitation=true, wind=true, humidity=true) {
        //Gets functional data of the time, which can be temp, precipitation, wind and humidity.
        let data = this.getData(time)
        if (data) {
            let fData = {}
            if (temp) fData.temp = data[0] || 0;
            if (precipitation) {
                //(data)
                let p = Number(data[2])
                //console.log(p)
                if (p <= 0) p = Number(data[3])
                //console.log(p)
                if (p <= 0) p = Number(data[4])
                //console.log(p)
                if (p <= 0) p = Number(0)
                fData.precipitation = p
            }
            if (wind) fData.wind = data[6] || 0;
            if (humidity) fData.humidity = data[9] || 0;
            //console.log(fData)
            return fData
        } else {
            return {
                temp: 0,
                precipitation: 0,
                wind: 0,
                humidity: 0
            }
        }
    }

}

function publish (fileName, data) {
    //Moves the data to a csv file to be interpreted by the neural Network.
    let buffer = "Wait,year,month,day,hour,minute,temp,precipitation"
    data.forEach((dCase) => {
        //console.log(dCase)
        buffer += `\n${dCase.wait},${dCase.year},${dCase.month},${dCase.day},${dCase.hour},${dCase.minute},${dCase.temp},${dCase.precipitation}`
    })
    fs.writeFileSync(`./FormattedData/${fileName}`, buffer)
    console.log(`Published ./FormattedData/${fileName}`)
}


module.exports = (argv) => {

    let rideName = argv.rideName || 'Big Thunder Mountain Railroad'

    console.log("Not completed")

    let data = Array()

    //Get Wait and Date from dataset

    //2019-01-22,19:00

    data = require("./getAttractionData")(rideName)

    //Assuming data[i] wait, year, month, day, hour and minute variables.

    let weather = new Weather("./Other data/weather.csv")
    weather.parse()
    
    data.forEach((dCase) => {
        //For each data case, find the appropriate weather infomation
        //Add 1900 to year as date starts from Jan 1st 00:00 1900
        console.verbose(dCase)
        let weatherData = weather.getFunctionalData(`${dCase.year+1900}-${dCase.month}-${dCase.day} ${dCase.hour}:00`)
        console.verbose(weatherData)
        console.verbose(`${dCase.year+1900}-${dCase.month}-${dCase.day} ${dCase.hour}:00`)
        dCase.temp = weatherData.temp
        dCase.precipitation = weatherData.precipitation
    })

    publish(`${rideName}.csv`, data)
}