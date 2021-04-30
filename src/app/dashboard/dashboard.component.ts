import { Component, OnInit } from '@angular/core';
import { MachineLearningService } from '../services/machine-learning/machine-learning.service';
import { DatabaseService } from '../services/database/database.service';
import { TrainingData } from '../services/signal-processing/signal-processing.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ping: number = 0;

  constructor(
    private db: DatabaseService,
    private mls: MachineLearningService,
    private http: HttpClient
  ) {
    
  }

  ngOnInit(): void {
    console.log("Initialised");

    // Promise.all([
    //   this.mls.loadModel(),
    //   this.http.get("./assets/resources/data/A01T/json/A01T-training-S100.json").toPromise()
    // ])
    //   .then(result => {
    //     let [model, data] = result;

    //     console.log(model);
    //     console.log(data);

    //     // let tensor =  this.mls.getTensorFromData();

    //     // let prediction = model.predict((data as any).data[0].inputs).print();
    //   })

    // this.mls.demo()
    //   .then((data: any) => {
    //     console.log("=========ML!========");
    //     console.log(data);


    //     // return;

    //     // let sample = result.data[0]
    //     // console.log(sample);

    //     var c = document.getElementById("myCanvas") as any;
    //     var ctx = c.getContext("2d");

    //     let drawSample = (sample) => {
    //       // let max = sample.inputs.reduce((acc, val) => acc > val ? acc : val, 0);
    //       let max = 5;
    //       // console.log(max);

    //       for ( let i=0; i<22*36; i++ ) {
    //         let y = Math.floor(i / 36);
    //         let x = i % 36;

    //         // console.log(x, y);

    //         ctx.beginPath();
    //         // ctx.lineWidth = "6";
    //         // ctx.strokeStyle = "red";
    //         let colorValue = sample.inputs[i] * 255 / max;
    //         // console.log(colorValue);
    //         ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    //         ctx.fillRect(10*x, 10*y, 10, 10);

            
    //       }
    //     }

    //     // Red rectangle
        

        
    //     // let i = 0;
    //     // setInterval(function() {
    //     //   drawSample(data[i % data.length]);
    //     //   i++;
    //     // }, 100);

    //     return data
    //   })
    //   .then((data) => {
    //     // return;
    //     let model = this.mls.getModel();
    //     console.log(model);
    //     console.log(data);

    //     let trainingFraction = 0.6;
    //     let trainingData = data.slice(0, Math.round(data.length*trainingFraction))
    //     let testingData = data.slice( Math.round(data.length*trainingFraction), data.length)

    //     let training = this.mls.train(model, trainingData, testingData);
    //     console.log(training);
    //     training
    //       .then(result => {
    //         console.log(result);
    //       })
    //   })

    this.db.bind("ping")
      .subscribe(ping => {
        console.log(ping);
      })
      
  }

}
