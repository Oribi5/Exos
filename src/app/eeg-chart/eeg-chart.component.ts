import { HttpClient } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { SignalProcessingService } from '../services/signal-processing/signal-processing.service';
import { dataSet } from './data';

@Component({
  selector: 'eeg-chart',
  templateUrl: './eeg-chart.component.html',
  styleUrls: ['./eeg-chart.component.css']
})
export class EegChartComponent implements OnInit, OnDestroy {

  data: any[];
  data2: any[];
  eeg: any[];
  view: [number, number] = [700, 300];

  interval: any = null;

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = false;
  yAxis: boolean = true;
  yAxisTicks: number[] = [-40, -20, 0, 20, 40]
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time /ms';
  yAxisLabel: string = 'EEG Channels';
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  constructor(
    private signalProcessing : SignalProcessingService
  ) {
    this.eeg = [];
    this.data = [];
    this.data2 = [];
  }
  



  setData(start: number, end: number) {
    let data = this.signalProcessing.getData(start, end);

    // console.log(data);
    this.data = data;

    let rawData = this.signalProcessing.rawChannels[0].slice(0, end)
    this.data2 = this.signalProcessing.getFrequencies(rawData);
  }

  ngOnDestroy(): void {
    if ( this.interval != null )
      window.clearInterval(this.interval);
  }

  ngOnInit(): void {

    
    this.data2 = this.signalProcessing.getFrequencies([])

    this.signalProcessing.dataLoaded
      .then(() => {

        let obj = this;
        // Current Time
        let time = 0;
        // Rate of Change of time
        let velocity = 1;
        // Frames per second
        let fps = 20;
        // Time seen in the window /ms
        let timeInterval = 500;

        let sampleInterval = this.signalProcessing.SAMPLING_RATE * timeInterval/1000;
        this.interval = setInterval(function() {
          obj.setData(time * sampleInterval, (time+1)*sampleInterval);
          time += velocity/fps;
        }, 1000/fps);

        
      });

    

    
  }

}
