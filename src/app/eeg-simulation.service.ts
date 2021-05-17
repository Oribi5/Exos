import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EegSimulationService {

  readonly data = [[1,1, 1], [1,2,3], [1,2,4], [1,2,5], [1,2,6], [1,2,7], [1,2,8], [1,2,9], [1,2,10]];
  readonly SAMPLE_RATE = 1;

  startTimeStamp: number;
  active: boolean = false;

  timer;

  constructor() {}

  start() {
    if (this.active) return; 

    this.startTimeStamp = Date.now();
    this.active = true;

    let duration = 1000*this.data.length / this.SAMPLE_RATE;

    let obj = this;
    this.timer = setTimeout(function() {
      obj.active = false;
    }, duration);
  }

  get(millisSegment: number): number[][] | null {
    if ( !this.active ) {
      console.error("EEG SIMULATION COMPLETE");
      return null;
    };

    let currentIndex = 1+Math.floor((Date.now() - this.startTimeStamp)/(1000 * this.SAMPLE_RATE));
    
    let startIndex = Math.floor(currentIndex - millisSegment / (this.SAMPLE_RATE * 1000));

    console.log(startIndex)

    if ( startIndex < 0 ) {
      startIndex = 0;
      console.warn("Simulation | Out-of-bounds requested truncated to appropriate bounds.")
    }

    return this.data.slice(startIndex, currentIndex);
  }

  pause() {

  }

  reset() {

  }
}
