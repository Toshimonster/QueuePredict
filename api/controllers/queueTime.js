const fs = require("fs")
const tf = require("@tensorflow/tfjs")
require("@tensorflow/tfjs-node")

exports.ping = (req, res, next) => {
    res.status(200).json({message: "Pong!"})
}

exports.getRides = (req, res, next) => {
    fs.readdir("./Models", (err, files) => {
        if (err) {res.status(501).json({message: "Error is reading directory", err: err})}
        else {res.status(200).json({message: "Success", content: files})}
    })
}

exports.getWaitTime = (req, res, next) => {
    //Check folder exists
    fs.exists(`./Models/${req.params.rideName}/model.json`, (exists) => {
        if (exists) {
            //Load model
            //Sanitation in the model tf ensures that injections cant ensue
            tf.loadLayersModel(`file://Models/${req.params.rideName}/model.json`)
                .then((model) => {
                    //Predict upon (the querys) year,month,day,hour,minute,temp,precipitation
                    //Use 1st Jan 2010 
                    //As the year maps like 2017 -> 117, subtract 1900.
                    //Temp is optional, and is measured in degrees. Inconsistant accuracy.
                    //Precipitation is optional, and is measured in mm. Inconsistant accuracy.
                    //Hour is from 0-23 inclusive
                    //Min is from 0-59 inclusive
                    //Month is from 1-12 inclusive
                    //Day is from 1-31 inclusive
                    let prediction = model.predict(tf.tensor2d([
                        [(Number(req.query.year) || 2010)-1900, (Number(req.query.month) || 0), Number(req.query.day) || 1, Number(req.query.hour) || 1, Number(req.query.minute) || 1, Number(req.query.temp) || 1, Number(req.query.precipitation) || 1]
                    ]))
                    prediction.array()
                        .then((a) => {
                            res.status(200).json({message: "Success!", content: a})
                        })
                })
                .catch((e) => {
                    res.status(400).json({message: "Model not found!", err: e})
                })
        } else {
            res.status(400).json({message: "Model not found!"})
        }
    })
}