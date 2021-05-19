import { HttpClient } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EegSimulationService {

  data: any[];
  readonly SAMPLE_RATE = 125;

  startTimeStamp: number;
  active: boolean = false;

  timer;

  constructor(
    private http: HttpClient
  ) {}

  async loadData() {

    let eeg_txt = await this.http.get(`assets/resources/data/A01T/eeg.csv`,
        { responseType: "text" }).toPromise()
        // .then(result => {
        //   console.log("EEG LOADED");
        //   return result;
        // }),

    let eeg = eeg_txt.split("\n")
        .map(line => line.split(",").map(str => parseFloat(str))
        );

    this.data = [];

    // console.log(eeg.pop());

    eeg.pop();

    function getStandardDeviation (array) {
      const n = array.length
      const mean = array.reduce((a, b) => a + b) / n
      const stdDev =  Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
      return [mean, stdDev];
    }

    for (let i = 0; i < 22; i++) {
      let min = Infinity, max = -Infinity;
      
      let channel = eeg.map(channel => {
        let val = channel[i];
        return val; 
      });

      let [mean, standardDeviation] = getStandardDeviation(channel);

      min = mean - 2*standardDeviation, max = mean + 2*standardDeviation;

      channel = channel.map(datum => -1+2*(datum-min)/(max - min))

      this.data.push(channel);
    }

    //Normalise
    console.log(this.data);
    

    console.log("EEG LOADED")
    // console.log(this.data);

    // const eegData = await Promise.all([
      
  }

  async start() {
    if (this.active) return; 

    await this.loadData();
    

    

    

    this.startTimeStamp = Date.now();
    this.active = true;

    // console.log(this.data.length);

    let duration = this.data[0].length / this.SAMPLE_RATE;

    console.log("Expected Duration: "+duration+"seconds");

    let hrs = Math.floor(duration/3600);
    let mins = Math.floor((duration % 3600)/(60));

    let secs = Math.floor((duration % 60));

    console.log(`${hrs} hrs: ${mins} mins: ${secs} secs`)

    let obj = this;
    this.timer = setTimeout(function() {
      obj.active = false;
    }, duration*1000);

    return;
  }

  get(range: number): number[][] | null {
    if ( !this.active ) {
      console.error("EEG SIMULATION COMPLETE");
      return null;
    };

    let currentIndex = 1+Math.floor((Date.now() - this.startTimeStamp)/(1000 / this.SAMPLE_RATE));
    
    let startIndex = currentIndex - range;

    // console.log(startIndex)
    // console.log(currentIndex);

    // console.log((Date.now() - this.startTimeStamp));

    if ( startIndex < 0 ) {
      startIndex = 0;
      console.warn("Simulation | Out-of-bounds requested truncated to appropriate bounds.")
    }

    return this.data.map(channel => channel.slice(startIndex, currentIndex))
    
    
    
  }

  stop() {
    this.active = false;
    console.log(this.active);
  }

  pause() {

  }

  reset() {

  }
}
