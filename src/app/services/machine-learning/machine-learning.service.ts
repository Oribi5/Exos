import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { saveAs } from 'file-saver/FileSaver';

import * as tf from '@tensorflow/tfjs';
import { LocalStorageService } from 'src/app/local-storage.service';
// import { Globals } from './globals';
// import * as bci from 'bcijs/browser.js'
import { SignalProcessingService, TrainingData } from '../signal-processing/signal-processing.service';

declare const bci: any;
@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {

  model: tf.Sequential;

  modelType: ArchitectureModels;

  constructor(
    private http: HttpClient,
    private sps: SignalProcessingService,
    private storage: LocalStorageService
  ) {
    console.log(bci);

    this.modelType = storage.get("model-type", ArchitectureModels.CONVOLUTIONAL); 
  }


  async saveModel(name:string = "my-model-1") {
    return await this.model.save('localstorage://'+name);
  }

  downloadCSV(data: any, name: string) {
    // const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(obj => Object.values(obj).join(","))
    // let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = name+'.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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

  createDenseModel() {
    const model = tf.sequential();
  }

  createConvolutionalModel() {
    // return this.generateModel2();
    const model = tf.sequential();
    
    const IMAGE_WIDTH = 22;
    const IMAGE_HEIGHT = 36;
    const IMAGE_CHANNELS = 1;  
    
    model.add(tf.layers.conv2d({
      inputShape: [22, 36, 1],
      kernelSize: 2,
      filters: 1,
      strides: 1,
      // kernelRegularizer: tf.regularizers.l2(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.conv2d({
      inputShape: [18, 32, 4],
      kernelSize: 2,
      filters: 2,
      strides: 1,
      // kernelRegularizer: tf.regularizers.l2(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.conv2d({
      inputShape: [14, 28, 4],
      kernelSize: 2,
      filters: 5,
      strides: 1,
      // kernelRegularizer: tf.regularizers.l2(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));


    model.add(tf.layers.batchNormalization());

    model.add(tf.layers.maxPooling2d({poolSize: [1, 2], strides: [1, 1]}));
    
    model.add(tf.layers.flatten());
  
    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    // const NUM_OUTPUT_CLASSES = 3;
    model.add(tf.layers.dense({
      units: 792,
      // kernelRegularizer: tf.regularizers.l2(),
      // kernelInitializer: 'varianceScaling',
      activation: 'sigmoid',
      useBias: true
    }));

    model.add(tf.layers.dense({
      units: 128,
      // kernelRegularizer: tf.regularizers.l2(),
      // kernelInitializer: 'varianceScaling',
      activation: 'sigmoid',
      useBias: true
    }));

    model.add(tf.layers.dense({
      units: 5,
      // kernelRegularizer: tf.regularizers.l2(),
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

  predict(data) {

  }

  async fullTrainingSequence(id: string = "1", skips: number = 50, notes: string = "#") {

    let subjects = ["A01T", "A02T", "A03T", "A04T", "A05T", "A06T", "A07T", "A08T", "A09T"];
    subjects = [`A0${id}T`];

    this.createConvolutionalModel();
    // return;

    let history = [];
    for ( let subject of subjects ) {
      let data = await this.sps.preprocessesData(subject, skips, this);
      history.push(data);
    }

    let stringAppend = `-${id}_J${skips}_${this.modelType}_${notes}`
    
    console.log(history);
    this.sps.downloadJSON(this.model, "Mod"+stringAppend);
    this.downloadCSV(history[0], "His"+stringAppend);
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
      if ( log.acc > 0.98 ) {
        this.model.stopTraining = true;
        console.log("Early stop due to ACC limit reached");
      }
    }
    let onBatchEnd = (epoch, log) => {
      // console.log(epoch);
      console.log(log);
      
    }
    // let onTrainEnd = ()
    if ( typeof this.model === "undefined" )
      this.createConvolutionalModel();
  
    return this.model.fit(trainXs, trainYs, {
      batchSize: 32,
      validationData: [testXs, testYs],
      epochs: 200,
      shuffle: true,
      callbacks: {onEpochEnd}
    });
  }
}

export enum ArchitectureModels {
  DENSE = "DENSE",
  CONVOLUTIONAL = "CONVOLUTIONAL"
}
