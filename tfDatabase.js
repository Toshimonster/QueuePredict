module.exports = (argv) => {
  require("./wrapper")(argv.argv)
  const tf = require("@tensorflow/tfjs")
  require("@tensorflow/tfjs-node")

  console.verbose("Running tfDatabase")

  const rideName = argv.argv._[1] || "Big_Thunder_Mountain_Railroad"
  const model = require("./modelTf")()
  console.verbose(`Ride name is : ${rideName}`)

  // eslint-disable-next-line no-useless-escape
  let datasetUrl = `file://FormattedData/${rideName}.csv`
  console.verbose(`File location pointed at ${datasetUrl}`)


  const dataset = tf.data.csv(
    datasetUrl, {
      columnConfigs: {
        Wait: {
          //Define Wait time as the label
          isLabel: true
        }
      }
    }
  )
  console.verbose("Initialized dataset")

  const flattenedDataset = dataset
    .map(({
      xs,
      ys
    }) => {
      // Convert xs and ys from object form  to array form.
      return {
        xs: Object.values(xs),
        ys: Object.values(ys)
      };
    }).batch(argv.argv._[2] || 50); //Batch size from yargs
  console.verbose("Flattened dataset")

  console.verbose("Fitting model to dataset")

  model.fitDataset(flattenedDataset, {
      epochs: argv.argv._[3] || 1 //Epochs from yargs
    })
    .then(() => {
      console.verbose("Successfully fitted dataset")
      model.save(`file://Models/${rideName}`)
        .then(() => {
          console.verbose(`Saved model at file://Models/${rideName}`)
          const prediction = model.predict(tf.tensor2d([
            [2002, 6, 6, 6, 6, 6, 6],
            [2001, 6, 6, 6, 6, 6, 6],
            [2001, 7, 5, 3, 2, 3, 0],
            [2003, 1, 1, 1, 1, 1, 1],
            [2004, 2, 2, 2, 2, 2, 2]
          ]));
          prediction.print();
        })
        .catch((err) => {
          console.log("Error while saving model!")
          console.error(err)
        })

    })
    .catch((err) => {
      console.log(`File at ${datasetUrl} does not exist! Please use a correct ride name.`)
      console.verbose(err)
    })

  /*
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 100,
      activation: 'relu',
      inputShape: [3]
    }));
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));
    model.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError'
    });
  
    let xs = []
    let ys = []
  
    for (let index = 0; index < 100; index++) {
      let v1 = Math.round(Math.random())
      let v2 = Math.round(Math.random())
      let v3 = Math.round(Math.random())
      xs.push([
        v1, v2, v3
      ])
      //OR gate
      ys.push([!(v1 || v2 || v3)])
    }
  
    //const xs = tf.randomNormal([100, 3]).arraySync();
    //const ys = tf.randomNormal([100, 1]);
    xs = tf.tensor2d(xs)
    ys = tf.tensor2d(ys)
  
    ys.print()
    xs.print()
  
    model.fit(xs, ys, {
      epochs: 1000,
      batchSize: 30,
      callbacks: {
        onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
      }
    }).then(() => {
      // Predict 3 random samples.
      const prediction = model.predict(tf.tensor2d([
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1]
      ]));
      prediction.print();
      
  
    })
    */
}