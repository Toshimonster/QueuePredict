module.exports = (rideName = "Big_Thunder_Mountain_Railroad.csv") => {
    const tf = require("@tensorflow/tfjs")
    require("@tensorflow/tfjs-node")

    const model = require("./modelTf")()
  
    // eslint-disable-next-line no-useless-escape
    let datasetUrl = `file://FormattedData/${rideName}.csv`

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

    console.log(dataset)

    const flattenedDataset = dataset
        .map(({xs, ys}) => {
            // Convert xs and ys from object form  to array form.
            return {xs:Object.values(xs), ys:Object.values(ys)};
        }).batch(1);

    console.log(flattenedDataset)

    model.fitDataset(flattenedDataset, {
        epochs: 1
    })
        .then(() => {
            model.save(`file://Models/${rideName}`)
              .then(() => {
                const prediction = model.predict(tf.tensor2d([
                  [2002, 6, 6, 6, 6, 6, 6],
                  [2001, 6, 6, 6, 6, 6, 6],
                  [2001, 7, 5, 3, 2, 3, 0],
                  [2003, 1, 1, 1, 1, 1, 1],
                  [2004, 2, 2, 2, 2, 2, 2]
                ]));
                prediction.print();
              })
            
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

module.exports()