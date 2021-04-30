import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as tf from '@tensorflow/tfjs';
// import { Globals } from './globals';
// import * as bci from 'bcijs/browser.js'
import { SignalProcessingService, TrainingData } from '../signal-processing/signal-processing.service';

declare const bci: any;
@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {

  model: tf.Sequential;

  constructor(
    private http: HttpClient,
    private sps: SignalProcessingService,
  ) {
    // console.log(bci);

    // let bci: any;
    console.log(bci);
    // console.log(tfvis);

    // var a = [
    //   [-1, -1],
    //   [1, 1]
    // ];
    
    // var b = [
    //   [-1, 1],
    //   [1, -1]
    // ];
    
    // var csp = bci.cspLearn(a, b);
    // console.log(csp);
    
    // var ap = csp.project(a, 2);
    // var bp = csp.project(b, 2);
    
    // console.log(ap);
  }

  // loadModel() {

  // }

  async saveModel(name:string = "my-model-1") {
    return await this.model.save('localstorage://'+name);
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

  generateModel2() {
    const model = tf.sequential();
  
    
    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    
    this.model = model;
    return model;
  
  }

  generateModel() {
    // return this.generateModel2();
    const model = tf.sequential();
    
    const IMAGE_WIDTH = 22;
    const IMAGE_HEIGHT = 36;
    const IMAGE_CHANNELS = 1;  
    
    model.add(tf.layers.conv2d({
      inputShape: [22, 36, 1],
      kernelSize: 5,
      filters: 4,
      strides: 1,
      // kernelRegularizer: tf.regularizers.l1(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.conv2d({
      // inputShape: [22, 36, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      // kernelRegularizer: tf.regularizers.l1(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.batchNormalization());

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [1, 1]}));

    // model.add(tf.layers.reshape({targetShape: [12, 33, 2]}))
  

    // model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // model.add(tf.layers.reshape({targetShape: [8, 11, 9]}))
  
    // model.add(tf.layers.conv2d({
    //   inputShape: [7, 14, 16],
    //   kernelSize: 5,
    //   filters: 16,
    //   strides: 2,
    //   kernelRegularizer: tf.regularizers.l1(),
    //   activation: 'relu',
    //   // kernelInitializer: 'varianceScaling'
    // }));

    
    model.add(tf.layers.flatten());
  
    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    // const NUM_OUTPUT_CLASSES = 3;
    model.add(tf.layers.dense({
      units: 792,
      // kernelRegularizer: tf.regularizers.l1(),
      // kernelInitializer: 'varianceScaling',
      activation: 'sigmoid',
      useBias: true
    }));

    

    // model.add(tf.layers.dense({
    //   units: 792,
    //   // kernelRegularizer: tf.regularizers.l1(),
    //   // kernelInitializer: 'varianceScaling',
    //   activation: 'sigmoid'
    // }));

    // model.add(tf.layers.reshape({targetShape: [128]}))

    model.add(tf.layers.dense({
      units: 128,
      // kernelRegularizer: tf.regularizers.l1(),
      // kernelInitializer: 'varianceScaling',
      activation: 'sigmoid',
      useBias: true
    }));

    // model.add(tf.layers.dense({
    //   units: 64,
    //   kernelRegularizer: tf.regularizers.l1(),
    //   // kernelInitializer: 'varianceScaling',
    //   activation: 'sigmoid'
    // }));

    // model.add(tf.layers.reshape({targetShape: [3]}))

    model.add(tf.layers.dense({
      units: 5,
      // kernelRegularizer: tf.regularizers.l1(),
      activation: 'softmax',
      useBias: true
    }));
  
    
    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  
    this.model = model;
    return model;
  }

  async loadModel(): Promise<any> {

    // let loadedModel = await tf.loadLayersModel('localstorage://my-model-1');
    // this.model = loadedModel as tf.Sequential;

    // const optimizer = tf.train.adam();
    // this.model.compile({
    //   optimizer: optimizer,
    //   loss: 'categoricalCrossentropy',
    //   metrics: ['accuracy'],
    // });
    // return this.model;
  }

  predict(data) {

  }

  async fullTrainingSequence(ctx: any) {

    let subjects = ["A01T", "A02T", "A03T", "A04T", "A05T", "A06T", "A07T", "A08T", "A09T"];
    subjects = ["A01T"];

    this.generateModel();
    // return;

    let history = [];
    for ( let subject of subjects ) {
      let data = await this.sps.preprocessesData(subject, this, ctx);
      history.push(data);
    }

    
    console.log(history);
    this.sps.downloadJSON(this.model, "model")
    this.sps.downloadJSON(history, "history")
    console.log("=================== Finished ===================");
    return;


    const availableData = [
      // { name: "A01T", size: 139 },
      // { name: "A02T", size: 137 },
      { name: "A03T", size: 138 },
      // { name: "A04T", size: 129 },
      // { name: "A05T", size: 130 },
      // { name: "A06T", size: 114 },
      // { name: "A07T", size: 134 },
      // { name: "A08T", size: 133 },
      // { name: "A09T", size: 117 },
    ];

    let datasets: string[] = [];
    availableData.forEach(datum => {
      for ( let i=0; i<datum.size; i++ ) {
        datasets.push(`${datum.name}_${i+1}`);
      }
    });

    console.log(datasets);

    function shuffle(array) {
      let currentIndex = array.length, temporaryValue, randomIndex;
    
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
    
      return array;
    }

    shuffle(datasets);
    console.log(datasets);


    // Generate Model
    // if ( fromLoad ) {
    //   await this.loadModel();
    // } else {
    //   this.generateModel();
    // }
    
    console.log(this.model);

    // Load 30 at a time, from random 
    const sampleSize = 25;

    // this.
    for ( let i=0; i<datasets.length; i+=sampleSize ) {
      let getRequests = [];
      for ( let j=0; j<sampleSize && j+i<datasets.length; j++ ) {
        let index = i+j;
        // console.log();
        let [reference, docNumber] = datasets[index].split("_");
        let request = this.http.get(`assets/resources/data/${reference}/json/${reference}-training-S${docNumber}.json`).toPromise();
        getRequests.push(request)
      }
      let response = await Promise.all(getRequests);
      let data = response.reduce((acc, val) => [...acc, ...val.data], []);

      let trainingFraction = 0.8;
      let fractionIndex = Math.round(trainingFraction * data.length);

      let trainingData = data.slice(0, fractionIndex);
      let validationData = data.slice(fractionIndex, data.length)

      await this.train(trainingData, validationData, () => {});

      console.log("Complete: "+(i+1)+"/"+Math.floor(datasets.length/sampleSize));

      // console.log(data);
    }

    this.saveModel();



    // Create array of objects to load

    // Shuffle the Array

    // Create Loop to iteratate of loop @ 10 datasets at a time

  }

  // async saveModel

  async train(trainingData: any, testData: any, callback: any) {
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

    // console.log(trainingInput);
    // console.log(testData);


    // const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = trainingData.length;
    const TEST_DATA_SIZE = testData.length;

    // console.log(TRAIN_DATA_SIZE, TEST_DATA_SIZE);
  
    const [trainXs, trainYs] = tf.tidy(() => {
      return [
        tf.tensor(trainingInput, [TRAIN_DATA_SIZE, 22, 36, 1]),
        tf.tensor(trainingOutput, [TRAIN_DATA_SIZE, 5])
      ];
    });
  
    const [testXs, testYs] = tf.tidy(() => {
      return [
        tf.tensor(testData.map(value => value.inputs), [TEST_DATA_SIZE, 22, 36, 1]),
        tf.tensor(testData.map(value => value.outputs), [TEST_DATA_SIZE, 5])
      ];
    });

    // console.log(trainXs, trainYs)

    let onEpochEnd = (epoch, log) => {
      console.log(epoch);
      console.log(log);
      callback(log);
    }
    let onBatchEnd = (epoch, log) => {
      // console.log(epoch);
      console.log(log);
      
    }
    // let onTrainEnd = ()
    if ( typeof this.model === "undefined" )
      this.generateModel();
  
    return this.model.fit(trainXs, trainYs, {
      batchSize: 32,
      validationData: [testXs, testYs],
      epochs: 200,
      shuffle: true,
      callbacks: {onEpochEnd}
    });
  }
}
