import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { TrainingData } from '../signal-processing/signal-processing.service';

@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {

  model: tf.Sequential;

  constructor(
    private http: HttpClient
  ) {}

  generateModel() {

  }

  // loadModel() {

  // }

  saveModel() {

  }


  

  // async demo(): Promise<TrainingData[]> {

    // let samples = 50;

    // let resourcePromises = [];
    // let root = "./assets/resources/data/A01T/json/A01T-training-S";
    // for ( let i=1; i<=samples; i++ ) {
    //   resourcePromises.push(this.http.get(root+i+".json").toPromise());
      
    // }

    // let data = Promise.all(resourcePromises) as Promise<TrainingData[]>;

    // // console.log(data)

    // const result = await data;
    // let data_1 = result.reduce((acc, val) => [...acc, ...val.data], []);
    // tf.util.shuffle(data_1);
    // console.log(data_1);
    // return data_1;

    // return this.http.get("./assets/resources/data/A01T/json/A01T-training-S1.json")
    //   .toPromise() ;
      

    // return;
    // Define a model for linear regression.
  //   const model = tf.sequential();
  //   model.add(tf.layers.dense({units: 1, inputShape: [1]}));

  //   // Prepare the model for training: Specify the loss and the optimizer.
  //   model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

  //   // Generate some synthetic data for training.
  //   const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
  //   const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

  //   // Train the model using the data.
  //   model.fit(xs, ys).then(() => {
  //     // Use the model to do inference on a data point the model hasn't seen before:
  //     let prediction = model.predict(tf.tensor2d([5], [1, 1]));

  //     console.log(prediction, prediction.toString());
  //   });
  // }

  getModel() {
    const model = tf.sequential();
    
    const IMAGE_WIDTH = 22;
    const IMAGE_HEIGHT = 36;
    const IMAGE_CHANNELS = 1;  
    
    // In the first layer of our convolutional neural network we have 
    // to specify the input shape. Then we specify some parameters for 
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
      inputShape: [22, 36, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    // model.add(tf.layers.reshape({targetShape: [12, 33, 2]}))
  
    model.add(tf.layers.conv2d({
      inputShape: [12, 33, 2],
      kernelSize: 5,
      filters: 16,
      strides: 2,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    // model.add(tf.layers.reshape({targetShape: [8, 11, 9]}))
  
    model.add(tf.layers.conv2d({
      inputShape: [8, 11, 9],
      kernelSize: 5,
      filters: 16,
      strides: 2,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.batchNormalization({
      inputShape: [8, 11, 9],
    }));

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [1, 1]}));

    model.add(tf.layers.flatten());
  
    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    // const NUM_OUTPUT_CLASSES = 3;
    model.add(tf.layers.dense({
      units: 792,
      kernelInitializer: 'varianceScaling',
      activation: 'sigmoid'
    }));

    // model.add(tf.layers.reshape({targetShape: [128]}))

    model.add(tf.layers.dense({
      units: 128,
      kernelInitializer: 'varianceScaling',
      activation: 'sigmoid'
    }));

    // model.add(tf.layers.reshape({targetShape: [3]}))

    model.add(tf.layers.dense({
      units: 3,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));
  
    
    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  
    return model;
  }

  async loadModel(): Promise<any> {
    let loadedModel = await tf.loadLayersModel('localstorage://my-model-1');
    this.model = loadedModel as tf.Sequential;
    // return this.model;
  }

  predict(data) {
    
  }

  train(model, trainingData: any, testData: any) {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    };
    // const fitCallbacks = (data) => {
    //   console.log(data);
    // };

    // consol

    let trainingInput = trainingData.map(value => value.inputs);
    let trainingOutput = trainingData.map(value => value.outputs);

    console.log(trainingInput);
    console.log(testData);
    


    // const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = trainingData.length;
    const TEST_DATA_SIZE = testData.length;

    console.log(TRAIN_DATA_SIZE, TEST_DATA_SIZE);
  
    const [trainXs, trainYs] = tf.tidy(() => {
      return [
        tf.tensor(trainingInput, [TRAIN_DATA_SIZE, 22, 36, 1]),
        tf.tensor(trainingOutput, [TRAIN_DATA_SIZE, 3])
      ];
    });
  
    const [testXs, testYs] = tf.tidy(() => {
      return [
        tf.tensor(testData.map(value => value.inputs), [TEST_DATA_SIZE, 22, 36, 1]),
        tf.tensor(testData.map(value => value.outputs), [TEST_DATA_SIZE, 3])
      ];
    });

    console.log(trainXs, trainYs)

    let onEpochEnd = (epoch, log) => {
      // console.log(epoch);
      console.log(log);
    }
    let onBatchEnd = (epoch, log) => {
      // console.log(epoch);
      console.log(log);
    }
    // let onTrainEnd = ()
  
    return model.fit(trainXs, trainYs, {
      batchSize: 32,
      validationData: [testXs, testYs],
      epochs: 30,
      shuffle: true,
      callbacks: {onEpochEnd}
    })
    .then((result) => { 
      console.log("save!")
      const saveResult = model.save('localstorage://my-model-1');
      return result;
    })
  }
}
