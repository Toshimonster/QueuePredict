// Returns the model for the tf training.
// Basic constant defining
const INPUTS  = 7
const OUTPUTS = 1

/*

RMSPROP 15.03
ADAM 8.21
ADAMAX 7.89
ADAMGRAD 26.25
ADADELTA fail



*/
module.exports = () => {
    const tf = require("@tensorflow/tfjs")
    require("@tensorflow/tfjs-node")

    // model = await tf.loadLayersModel('file://MODELTEST')


    const model = tf.sequential();

    model.add(tf.layers.dense({
        units: 20,
        activation: 'relu',
        inputShape: [INPUTS]
    }));
    /*model.add(tf.layers.dense({
        units: 20,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: 10,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: 10,
        activation: 'relu'
    }));*/
    model.add(tf.layers.dense({
        units: 22,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: 22,
        activation: 'linear'
    }));
    model.add(tf.layers.dense({
        units: OUTPUTS,
        activation: 'linear'
    }));
    model.compile({
        optimizer: 'adamax',
        loss: 'meanSquaredError'
    });
    return model
}