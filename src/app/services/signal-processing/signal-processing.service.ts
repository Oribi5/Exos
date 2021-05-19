import { HttpClient } from '@angular/common/http';
import { Injectable, Sanitizer } from '@angular/core';
import { Observable } from 'rxjs';
import * as FFT from 'fft-js';
import { SafeUrl } from '@angular/platform-browser';
import { train } from '@tensorflow/tfjs-core';
import { MachineLearningService } from '../machine-learning/machine-learning.service';
// import { saveAs } from 'file-saver/FileSaver';
// import * as transform from 'transform';

// import 'rxjs/add/operator/toPromise';
@Injectable({
  providedIn: 'root'
})
export class SignalProcessingService {

  readonly SAMPLING_RATE: number = 250;
  readonly FREQUENCY_WINDOW: number = Math.pow(2, 7);
  readonly ID_AVAILABLE: string[] = ["A01T"];

  dataLoaded: Promise<boolean>;

  channels: EEGDataInterface[];
  rawChannels: number[][];

  constructor(
    private http: HttpClient,
    private sanitizer: Sanitizer
  ) {
    this.channels = [];
    this.rawChannels = [];
    // this.dataLoaded = this.loadData();


  }

  loadData(): Promise<boolean> {
    return this.http.get("./assets/resources/data/eeg_test.csv", {responseType: "text"})
      .toPromise()
      .then(results => {

        let rawChannels = results.split("\n");

        // Remove EOG & Trail
        let filteredChannelStrings = rawChannels.filter(
          (channel: string) => channel.length > 0 && !channel.includes("EOG")
        );

        this.rawChannels = filteredChannelStrings.map(channelString => {
          return channelString
            .split(",")
            .slice(1)
            .map(value => parseFloat(value));
        })

        this.channels = filteredChannelStrings.map(channelString => {
          let channel = channelString.split(",");
          return {
            name: channel.shift()?.replace(/'/gi, "") as string,
            series: channel.map((value, index) => {
              return {
                "name": (index/this.SAMPLING_RATE),
                "value": parseFloat(value)
              }
            })
          }
        });

        console.log("EEG DATA:");
        console.log(this.rawChannels);
        console.log(this.channels);

        return true;
      })
  }

  getData(startIndex: number = 0, endIndex: number = this.rawChannels[0]?.length)  {
    return this.channels.map(channel => { 
      return {
        name: channel.name,
        series: channel.series.slice(startIndex, endIndex) 
      }
    })
  }

  getFrequencies(arr: any[]): any[] {
    // let signal = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];

    // console.log(arr);

    let sigLength = Math.pow(2, 7);

    if ( arr.length < sigLength ) {
      return [];
    }

    if ( arr.length > sigLength ) {
      arr = arr.slice(arr.length - sigLength, arr.length);
    }

    // console.log(arr);

    let signal = arr;

    // let freqs = [5, 10, 15, 17, 20, 25, 30, 35];
    // let exp = 7;

    // let signal = Array(Math.pow(2, exp));
    // for ( let i=0; i<signal.length; i++ ) {
    //   // signal[i] = Math.sin();
    //   let signalValue = 0;
    //   for ( let freq of freqs ) {
    //     // signalValue += 0.5 + 0.5*Math.sin(Math.PI/2 + i * (2*Math.PI)*freq);
    //     signalValue += 0.5 + 0.5*Math.sin(Math.PI/2 + 2*Math.PI * freq * (i/signal.length));
    //   }
    //   signal[i] = signalValue;
    // }
    
    // console.log(signal);
    

    // let im = [];
    // signal.forEach(val => im.push(val));

    // let result = transform(signal, im);
    // console.log(result);
    // console.log(signal);

    // console.log(FFT);

    let phasors = FFT.fft(signal)
      // .map(complex => complex[0]);

    let frequencies = FFT.util.fftFreq(phasors, 125) as any[], // Sample rate and coef is just used for length, and frequency step
    magnitudes = FFT.util.fftMag(phasors) as any[]; 

    let both = frequencies.map(function (f, ix) {
        return {frequency: f, magnitude: magnitudes[ix]/signal.length};
    });

    // console.log(both);
    // console.log(phasors);

    both.shift();

    both = both.filter(pair => {
      return pair.frequency >= 4 && pair.frequency <= 40
    });

    return both.map(pair => {
      return {
        name: Math.round(10*pair.frequency)/10,
        value: pair.magnitude
      }
    })
  }

  async preprocessesData(id: string, skips:number=50, mls?: MachineLearningService) {

    console.log(id);

    // Load data files
    let root = `assets/resources/data/${id}`;

    const eegData = await Promise.all([
      this.http.get(`${root}/eeg.csv`,
        { responseType: "text" }).toPromise()
        .then(result => {
          console.log("EEG LOADED");
          return result;
        }),

      this.http.get(`${root}/stim-code.csv`,
        { responseType: "text" }).toPromise()
        .then(result_1 => {
          console.log("STIM CODES LOADED");
          return result_1;
        }),

      this.http.get(`${root}/stim-pos.csv`,
        { responseType: "text" }).toPromise()
        .then(result_2 => {
          console.log("STIM POS LOADED");
          return result_2;
        }),
    ]);
    let [eeg_txt, stimCodes_txt, stimPositions_txt] = eegData;

    let stimCodes = stimCodes_txt.split(",").map(val => parseFloat(val)),
      stimPositions = stimPositions_txt.split(",").map(val_1 => parseFloat(val_1)),
      eeg = eeg_txt.split("\n")
        .map(line => line.split(",").map(str => parseFloat(str))
        );

    // Transpose EEG's 22 (cut 23, 24, & 25 EOG channels)
    let channels = [];
    for (let i = 0; i < 22; i++) {
      channels.push(eeg.map(channels_1 => channels_1[i]));
    }

    eeg = channels;
    channels = null;

    console.log(stimCodes, stimPositions);
    console.log(eeg);

    let stimData: Stim[] = stimCodes.map((code, index) => {
      return {
        code: code,
        position: stimPositions[index]
      };
    });

    // --------------- Configure data.js ---------------
    let dataObject = {
      name: id,
      date: Date.now(),
      duration: eeg[0].length / this.SAMPLING_RATE,
      eeg: eeg,
      stim: stimData
    };

    // this.downloadJSON(dataObject, `${id}-eeg`);
    // --------------- Configure data-training.js ---------------
    let lastSplicePosition = 0;
    let lastSpliceIndex = -1;

    let set = 0;

    // let data = [];
    let trainingData = [];

    let history = [];

    let bounds = Array(22);
    for ( let i=0; i<bounds.length; i++ ) {
      bounds[i] = {
        min: Infinity,
        max: -Infinity
      };
    }

    console.log(bounds);
    
    let starting = 0;
    if ( !mls ) {
      starting = Math.floor(stimData.length * Math.random());
    }

    for (let i_1 = starting; i_1 < stimData.length; i_1++) {
      if (stimData[i_1].code == EventType.StartOfTrial) {

        let stims = stimCodes.slice(lastSpliceIndex + 1, i_1);

        // Filter
        let validTrial = [
          EventType.CueOnset_Unknown,
          // EventType.CueOnset_Tongue,
          // EventType.CueOnset_Foot,
          EventType.RejectTrial
        ].reduce((acc, val_2) => {
          return !stims.includes(val_2) && acc;
        }, true);

        if (validTrial) {
          set++;

          //Extract data from 3 - 5 seconds
          let startOffset = 3000;
          let length = 2000;

          let startIndex = lastSplicePosition + startOffset;

          let eegSegment = eeg.map(channel => channel.slice(startIndex, startIndex + length));
          console.log("Length: " + (eegSegment[0].length));
          console.log(stims);

          for (let j = 0; j < eegSegment[0].length - this.FREQUENCY_WINDOW; j+=skips) {
            let obj = this;

            let inputs = eegSegment
              .map(channel => channel.slice(j, j + this.FREQUENCY_WINDOW))
              .map((channel, index) => obj.getFrequencies(channel).map(datum => {
                // Update channel bounds
                let val = datum.value;
                bounds[index].min = Math.min(bounds[index].min, val);
                bounds[index].max = Math.max(bounds[index].max, val);

                return val;
              }))
              .reduce((acc_1, val_3) => [...acc_1, ...val_3], []);

            // Concat channels to singular input array
            // let inputs = [...frequencies];
            let outputs: number[];

            if (stims.includes(EventType.CueOnset_Left)) {
              outputs = [1, 0, 0, 0, 0]; // Left 
            } else if (stims.includes(EventType.CueOnset_Right)) {
              outputs = [0, 1, 0, 0, 0]; // Right
            } else if (stims.includes(EventType.CueOnset_Foot)) {
              outputs = [0, 0, 1, 0, 0]; // Foot
            } else if (stims.includes(EventType.CueOnset_Tongue)) {
              outputs = [0, 0, 0, 1, 0]; // Tongue
            } else {
              outputs = [0, 0, 0, 0, 1]; // Idle
            }

            if ( !mls ) {
              return {inputs, outputs};
            }

            trainingData.push({ inputs, outputs });
          }
        }

        lastSplicePosition = stimData[i_1].position;
        lastSpliceIndex = i_1;

      }
      console.log(Math.round(100 * (i_1 + 1) / stimData.length) + "% Complete");
    }

    if ( !mls ) {
      return this.preprocessesData(id, skips);
    }

    console.log(bounds);

    trainingData.forEach(set => {
      set.inputs = set.inputs.map((val, index) => {
        let i = Math.floor(index / 36); 
        // console.log(i);
        return (val - bounds[i].min)/bounds[i].max;
      });
    });

    console.log(trainingData)

    // function shuffle(array) {
    //   let currentIndex = array.length, temporaryValue, randomIndex;
    
    //   // While there remain elements to shuffle...
    //   while (0 !== currentIndex) {
    
    //     // Pick a remaining element...
    //     randomIndex = Math.floor(Math.random() * currentIndex);
    //     currentIndex -= 1;
    
    //     // And swap it with the current element.
    //     temporaryValue = array[currentIndex];
    //     array[currentIndex] = array[randomIndex];
    //     array[randomIndex] = temporaryValue;
    //   }
    
    //   return array;
    // }

    // shuffle(trainingData);

    if ( mls ) {
      let trainingFraction = 0.8;
      let fractionIndex = Math.round(trainingFraction * trainingData.length);

      let training = trainingData.slice(0, fractionIndex);
      let validation = trainingData.slice(fractionIndex, trainingData.length);

      await mls.train(training, validation, (log) => {
        // console.log("Working!");
        history.push(log);
      });
    }

    
    

    // await mls.saveModel("model");
    console.log(history);

    return history;
  }

  async preprocessesData2(id: string, skips:number=50, mls?: MachineLearningService) {

    console.log(id);

    // Load data files
    let root = `assets/resources/data/${id}`;

    const eegData = await Promise.all([
      this.http.get(`${root}/eeg.csv`,
        { responseType: "text" }).toPromise()
        .then(result => {
          console.log("EEG LOADED");
          return result;
        }),

      this.http.get(`${root}/stim-code.csv`,
        { responseType: "text" }).toPromise()
        .then(result_1 => {
          console.log("STIM CODES LOADED");
          return result_1;
        }),

      this.http.get(`${root}/stim-pos.csv`,
        { responseType: "text" }).toPromise()
        .then(result_2 => {
          console.log("STIM POS LOADED");
          return result_2;
        }),
    ]);
    let [eeg_txt, stimCodes_txt, stimPositions_txt] = eegData;

    let stimCodes = stimCodes_txt.split(",").map(val => parseFloat(val)),
      stimPositions = stimPositions_txt.split(",").map(val_1 => parseFloat(val_1)),
      eeg = eeg_txt.split("\n")
        .map(line => line.split(",").map(str => parseFloat(str))
        );

    // Transpose EEG's 22 (cut 23, 24, & 25 EOG channels)
    let channels = [];
    for (let i = 0; i < 22; i++) {
      channels.push(eeg.map(channels_1 => channels_1[i]));
    }

    eeg = channels;
    channels = null;

    console.log(stimCodes, stimPositions);
    console.log(eeg);

    let stimData: Stim[] = stimCodes.map((code, index) => {
      return {
        code: code,
        position: stimPositions[index]
      };
    });

    // --------------- Configure data.js ---------------
    let dataObject = {
      name: id,
      date: Date.now(),
      duration: eeg[0].length / this.SAMPLING_RATE,
      eeg: eeg,
      stim: stimData
    };

    // this.downloadJSON(dataObject, `${id}-eeg`);
    // --------------- Configure data-training.js ---------------
    let lastSplicePosition = 0;
    let lastSpliceIndex = -1;

    let set = 0;

    // let data = [];
    let trainingData = [];

    let history = [];

    let bounds = Array(22);
    for ( let i=0; i<bounds.length; i++ ) {
      bounds[i] = {
        min: Infinity,
        max: -Infinity
      };
    }

    console.log(bounds);
    
    let starting = 0;
    if ( !mls ) {
      starting = Math.floor(stimData.length * Math.random());
    }

    for (let i_1 = starting; i_1 < stimData.length; i_1++) {
      if (stimData[i_1].code == EventType.StartOfTrial) {

        let stims = stimCodes.slice(lastSpliceIndex + 1, i_1);

        // Filter
        let validTrial = [
          EventType.CueOnset_Unknown,
          // EventType.CueOnset_Tongue,
          // EventType.CueOnset_Foot,
          EventType.RejectTrial
        ].reduce((acc, val_2) => {
          return !stims.includes(val_2) && acc;
        }, true);

        if (validTrial) {
          set++;

          //Extract data from 3 - 5 seconds
          let startOffset = 3000;
          let length = 2000;

          let startIndex = lastSplicePosition + startOffset;

          let eegSegment = eeg.map(channel => channel.slice(startIndex, startIndex + length));
          console.log("Length: " + (eegSegment[0].length));
          console.log(stims);

          let window = 32;

          for (let j = 0; j < eegSegment[0].length - window; j+=skips) {
            let obj = this;

            let inputs = eegSegment
              .map(channel => channel.slice(j, j + window))
              .map((channel, index) => obj.generateGramianAngularFields(channel).map(datum => {
                // console.log(datum);
                // Update channel bounds
                // let val = datum.value;
                // bounds[index].min = Math.min(bounds[index].min, val);
                // bounds[index].max = Math.max(bounds[index].max, val);

                return datum;
              }));
            
            //Invert array from 22 * 128 * 128 -> 128 * 128 * 22

            let invertedInput = [];
            for ( let y=0; y<window; y++ ) {
              invertedInput[y] = [];
              for ( let x=0; x<window; x++ ) {
                invertedInput[y][x] = [];
                for ( let k=0; k<22; k++ ) {
                  invertedInput[y][x][k] = inputs[k][y][x];
                }
              }
            }

            inputs = invertedInput;


            // .reduce((acc_1, val_3) => [...acc_1, ...val_3], []);

            // Concat channels to singular input array
            // let inputs = [...frequencies];
            let outputs: number[];

            if (stims.includes(EventType.CueOnset_Left)) {
              outputs = [1, 0, 0, 0, 0]; // Left 
            } else if (stims.includes(EventType.CueOnset_Right)) {
              outputs = [0, 1, 0, 0, 0]; // Right
            } else if (stims.includes(EventType.CueOnset_Foot)) {
              outputs = [0, 0, 1, 0, 0]; // Foot
            } else if (stims.includes(EventType.CueOnset_Tongue)) {
              outputs = [0, 0, 0, 1, 0]; // Tongue
            } else {
              outputs = [0, 0, 0, 0, 1]; // Idle
            }

            if ( !mls ) {
              return {inputs, outputs};
            }

            trainingData.push({ inputs, outputs });

            console.log({inputs, outputs})
          }
        }

        lastSplicePosition = stimData[i_1].position;
        lastSpliceIndex = i_1;

      }
      console.log(Math.round(100 * (i_1 + 1) / stimData.length) + "% Complete");
    }

    if ( !mls ) {
      return this.preprocessesData(id, skips);
    }

    console.log(bounds);

    // trainingData.forEach(set => {
    //   set.inputs = set.inputs.map((val, index) => {
    //     let i = Math.floor(index / 36); 
    //     // console.log(i);
    //     return (val - bounds[i].min)/bounds[i].max;
    //   });
    // });

    console.log(trainingData)

    // function shuffle(array) {
    //   let currentIndex = array.length, temporaryValue, randomIndex;
    
    //   // While there remain elements to shuffle...
    //   while (0 !== currentIndex) {
    
    //     // Pick a remaining element...
    //     randomIndex = Math.floor(Math.random() * currentIndex);
    //     currentIndex -= 1;
    
    //     // And swap it with the current element.
    //     temporaryValue = array[currentIndex];
    //     array[currentIndex] = array[randomIndex];
    //     array[randomIndex] = temporaryValue;
    //   }
    
    //   return array;
    // }

    // shuffle(trainingData);

    if ( mls ) {
      let trainingFraction = 0.8;
      let fractionIndex = Math.round(trainingFraction * trainingData.length);

      let training = trainingData.slice(0, fractionIndex);
      let validation = trainingData.slice(fractionIndex, trainingData.length);

      await mls.train(training, validation, (log) => {
        // console.log("Working!");
        history.push(log);
      });
    }

    
    

    // await mls.saveModel("model");
    console.log(history);

    return history;
  }

  generateGramianAngularFields(signal, summation: boolean = true) {
    // normalise between -1 & 1
    let [min, max] = signal.reduce((acc, val) => {
      let [min, max] = acc;
      min = Math.min(min, val);
      max = Math.max(max, val);
      return [min, max]

    }, [Infinity, -Infinity]);
    
    // Normalise and convert to angle in one function
    let polar = signal.map(val => {
      let normalisedValue = -1+2*(val-min)/(max - min);
      return Math.acos(normalisedValue);
    });
    
    let trigFn = summation ? Math.cos : Math.sin;
    
    let gramMatrix = [];
    for ( let i=0; i<polar.length; i++ ) {
      let row = [];
      for ( let j=0; j<polar.length; j++ ) {
        row[j] = summation ?
          Math.cos(polar[i] + polar[j]) : 
          Math.sin(polar[i] - polar[j]);
      }
      gramMatrix[i] = row;
    }

    // console.log(gramMatrix);

    return gramMatrix;
  }

  downloadJSON(object: any, name: string = "download") {
    var sJson = JSON.stringify(object);

    let theJSON = JSON.stringify(object);
    let blob = new Blob([theJSON], { type: 'text/json' });
    let url= window.URL.createObjectURL(blob);
    // let uri:SafeUrl = this.sanitizer.bypassSecurityTrustUrl(url);


    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', name+".json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }
}

export interface EEGDataInterface {
  name: string,
  series: {
    name: string | number,
    value: number
  }[]
}

export enum EventType {
  IdleEEG_EyesOpen = 276,
  IdleEEG_EyesClosed = 277,
  StartOfTrial = 768,
  CueOnset_Left = 769,
  CueOnset_Right = 770,
  CueOnset_Foot = 771,
  CueOnset_Tongue = 772,
  CueOnset_Unknown = 783,
  RejectTrial = 1023,
  EyeMovements = 1072
}

export enum EventClass {
  Left = EventType.CueOnset_Left,
  Right = EventType.CueOnset_Right,
  Foot = EventType.CueOnset_Foot,
  Tongue = EventType.CueOnset_Tongue,
}

export interface Stim {
  code: number,
  position: number
}

export interface TrainingData {
  name: string,
  id: number,
  data: {
    inputs: [],
    outputs: []
  }[]
}