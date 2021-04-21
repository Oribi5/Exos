import { HttpClient } from '@angular/common/http';
import { Injectable, Sanitizer } from '@angular/core';
import { Observable } from 'rxjs';
import * as FFT from 'fft-js';
import { SafeUrl } from '@angular/platform-browser';
import { train } from '@tensorflow/tfjs-core';
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
    this.dataLoaded = this.loadData();


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

  preprocessesData(id: string) {

    // this.downloadJSON({test: false}, "test")
    // return;

    console.log(id);

    // Load data files
    let root = `assets/resources/data/${id}`;

    Promise.all([
      this.http.get(`${root}/eeg.csv`, 
        {responseType: "text"}).toPromise()
        .then(result => {
          console.log("EEG LOADED");
          return result;
        }),

      this.http.get(`${root}/stim-code.csv`, 
        {responseType: "text"}).toPromise()
        .then(result => {
          console.log("STIM CODES LOADED");
          return result;
        }),

      this.http.get(`${root}/stim-pos.csv`, 
        {responseType: "text"}).toPromise()
        .then(result => {
          console.log("STIM POS LOADED");
          return result;
        }),
    ])
    .then(result => {
      // console.log(result);
      let  [eeg_txt, stimCodes_txt, stimPositions_txt] = result;

      let stimCodes = stimCodes_txt.split(",").map(val => parseFloat(val)),
          stimPositions = stimPositions_txt.split(",").map(val => parseFloat(val)),
          eeg = eeg_txt.split("\n")
            .map(line => 
                line.split(",").map(str => parseFloat(str))
            );
      
      // Transpose EEG's 22 (cut 23, 24, & 25 EOG channels)
      let channels = [];
      for ( let i=0; i<22; i++ ) {
        channels.push(eeg.map(channels => channels[i]))
      }

      eeg = channels;
      channels = null;

      console.log(stimCodes, stimPositions);
      console.log(eeg);

      let stimData: Stim[] = stimCodes.map((code, index) => {
        return {
          code: code,
          position: stimPositions[index]
        }
      });

      // --------------- Configure data.js ---------------
      let dataObject = {
        name: id,
        date: Date.now(),
        duration: eeg[0].length / this.SAMPLING_RATE,
        eeg: eeg,
        stim: stimData

      };

      console.log(dataObject);

      // this.downloadJSON(dataObject, `${id}-eeg`);

      // --------------- Configure data-training.js ---------------

      
      let lastSplicePosition = 0;
      let lastSpliceIndex = -1;

      let set = 0;

      for ( let i=0; i<stimData.length; i++ ) {
        if ( stimData[i].code == EventType.StartOfTrial ) {

          let stims = stimCodes.slice(lastSpliceIndex+1, i);
          

          // Filter
          let validTrial = 
            [
              EventType.CueOnset_Unknown,
              EventType.CueOnset_Tongue,
              EventType.CueOnset_Foot,
              EventType.RejectTrial
            ].reduce((acc, val) => {
              return !stims.includes(val) && acc;
            }, true);
          
          if ( validTrial ) {
            set++;

            //Extract data from 3 - 5 seconds
            let startOffset = 3000;
            let length = 2000;

            let startIndex = lastSplicePosition + startOffset;

            let eegSegment = eeg.map(channel => channel.slice(startIndex, startIndex + length));
            console.log("Length: "+(eegSegment[0].length));
            console.log(stims);

            let trainingData = [];

            for ( let j = 0; j<eegSegment[0].length - this.FREQUENCY_WINDOW; j++) {
              let obj = this;

              let inputs = eegSegment
                .map(channel => channel.slice(j, j+this.FREQUENCY_WINDOW))
                .map(channel => obj.getFrequencies(channel).map(datum => datum.value))
                .reduce((acc, val) => [...acc, ...val], [])

              // Concat channels to singular input array
              // let inputs = [...frequencies];
              let outputs: number[];

              if ( stims.includes(EventType.CueOnset_Left) ) {
                outputs = [1, 0, 0]; // Left 
                // console.log("Left");
              } else if ( stims.includes(EventType.CueOnset_Right) ) {
                outputs = [0, 1, 0]; // Right
                // console.log("Right");
              } else {
                outputs = [0, 0, 1]; // Idle
                // console.log("Idle");
              }

              trainingData.push({inputs, outputs});
              // console.log(outputs);
              // console.log(trainingData);

              // console.log((i+1) + " / " + (eegSegment[0].length - this.FREQUENCY_WINDOW) );

              if (i == 0)
                console.log(inputs)

              // let input = 
            }

            this.downloadJSON({
              name: id,
              set,
              data: trainingData
            }, `${id}-training-S${set}`);

            // return;

            // remove to traverse all data
            // break;
          }

          lastSplicePosition = stimData[i].position;
          lastSpliceIndex = i;

        }
        console.log(Math.round(100*(i+1)/stimData.length) + "% Complete");
      }

      // console.log(eegSegme);

      // let trainingObject ={
      //   name: id,
      //   data: trainingData
      // }

      // console.log(trainingObject);

      // this.downloadJSON(dataObject, `${id}-eeg`);
      // console.log(JSON.stringify(trainingObject));
      // this.downloadJSON(trainingObject, `${id}-training`);

    })
    .catch(error => {
      // console.error
      console.error("Error not found :(");
      console.error(error);
    })
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