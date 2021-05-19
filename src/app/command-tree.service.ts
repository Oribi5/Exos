import { Injectable } from '@angular/core';
import { callbacks } from '@tensorflow/tfjs-layers';
import { EegSimulationService } from './eeg-simulation.service';
import { LocalStorageService } from './local-storage.service';
import { CommandInterfaceService } from './services/command-interface/command-interface.service';
import { ArchitectureModels, MachineLearningService } from './services/machine-learning/machine-learning.service';
import { SignalProcessingService } from './services/signal-processing/signal-processing.service';

@Injectable({
  providedIn: 'root'
})
export class CommandTreeService {

  constructor(
    private cis: CommandInterfaceService,
    private mls: MachineLearningService,
    private sps: SignalProcessingService,
    private storage: LocalStorageService,
    private simulation: EegSimulationService
  ) {}

  readonly CommandTree: CommandBranchInterface[] = [

 
    {
        type: CommandType.NAMESPACE,
        name: ["remote"],
        dir: [
  
            {
                type: CommandType.COMMAND,
                name: ["LED", "led"],
                expected: [
                    {
                        params: [],
                        description: "Gets the BUILTIN_LED state of the ESP8266 module.",
                        callback: () => {
                            this.cis.sendRemoteCommand("LED")
                        }
                    },
                    {
                        params: ["newState"],
                        description: "Sets the BUILTIN_LED state of the ESP8266 module ['e.g. on, 1, true']",
                        callback: (newState) => {
                          this.cis.sendRemoteCommand(`LED ${newState}`)
                        }
                    }
                ]
            },
            {
                type: CommandType.COMMAND,
                name: ["power"],
                expected: [
                    {
                        params: [],
                        description: "Returns the current power state.",
                        callback: () => {
  
                        }
                    },
                    {
                        params: ["on_off_state"],
                        description: "Sets the power status of the ESP8266",
                        callback: (param) => {
  
                        }
                    }
                ]
            },
            {
                type: CommandType.NAMESPACE,
                name: ["database", "db"],
                dir: [
                    {
                        type: CommandType.COMMAND,
                        name: ["init"],
                        expected: [
                            {
                                params: [],
                                description: "Initialised Wifi - Firebase Connection (Note this is automatic).", 
                                warning: "Connection will temporarily be lost.",
                                callback: () => {
  
                                }
                            },
                        ]
                    },
                    {
                        type: CommandType.COMMAND,
                        name: ["init"],
                        expected: [
                            {
                                params: [],
                                description: "Returns Connection Status.", 
                                callback: () => {
  
                                }
                            },
                        ]
                    },
                    {
                        type: CommandType.COMMAND,
                        name: ["init"],
                        expected: [
                            {
                                params: [],
                                description: "Returns Connection IP Address.", 
                                callback: () => {
  
                                }
                            },
                        ]
                    },
                    {
                        type: CommandType.COMMAND,
                        name: ["init"],
                        expected: [
                            {
                                params: [],
                                description: "Initialised Wifi - Firebase Connection (Note this is automatic).", 
                                warning: "You will no longer be able to remotely control the EXO-S System until ESP8266 system restart.",
                                callback: () => {
  
                                }
                            },
                        ]
                    },
                ],
            },
  
        ],
    },
    {
        type: CommandType.NAMESPACE,
        name: ["ml", "ai"],
        dir: [
            {
                type: CommandType.COMMAND,
                name: ["train"],
                expected: [
                    {
                        params: ["userNumber", "skips", "notes"],
                        description: "Trains a model using the default settings.",
                        callback: ([userNumber, skips, notes]) => {
                            console.log({userNumber, skips, notes});
                            this.mls.fullTrainingSequence(userNumber, skips, notes)
                        }
                    }
                ]
            },
            {
                type: CommandType.COMMAND,
                name: ["mode"],
                expected: [
                    {
                        params: [],
                        description: "Get machine learning mode.",
                        callback: () => {
                            console.log(this.mls.modelType);
                        }
                    }
                ]
            },
            {
                type: CommandType.COMMAND,
                name: ["toggleMode"],
                expected: [
                    {
                        params: [],
                        description: "Toggles analysis mode.",
                        callback: () => {
                            if ( this.mls.modelType === ArchitectureModels.CONVOLUTIONAL ) {
                                this.mls.modelType = ArchitectureModels.DENSE;
                            } else {
                                this.mls.modelType = ArchitectureModels.CONVOLUTIONAL;
                            }
                            this.storage.set("model-type", this.mls.modelType);
                            console.log(`Mode set to ${this.mls.modelType}`);
                        }
                    }
                ]
            },
        ],
    },
    {
        type: CommandType.NAMESPACE,
        name: ["simulate", "sim"],
        dir: [
            {
                type: CommandType.COMMAND,
                name: ["start", "begin"],
                expected: [
                    {
                        params: [],
                        description: "Start EEG simulation.",
                        callback: async () => {
                            await this.simulation.start();
                        }
                    }
                ]
            },
            {
                type: CommandType.COMMAND,
                name: ["stop", "begin"],
                expected: [
                    {
                        params: [],
                        description: "Ends EEG simulation.",
                        callback: () => this.simulation.stop()
                    }
                ]
            },
        ],
    },
    {
        type: CommandType.COMMAND,
        name: ["fft"],
        expected: [
            {
                params: [],
                description: "Trains a model using the default settings.",
                callback: async () => {
                    let c = document.getElementById("myCanvas") as any;
                    let ctx = c.getContext("2d");

                    console.log(ctx);

                    let { inputs, outputs } = await this.sps.preprocessesData("A01T", 50);
                    console.log(inputs)
                    console.log(outputs);

                    let sample = inputs;

                    for ( let i=0; i<22*36; i++ ) {
                        let y = Math.floor(i / 36);
                        let x = i % 36;

                        // console.log(x, y);

                        ctx.beginPath();
                        // ctx.lineWidth = "6";
                        // ctx.strokeStyle = "red";
                        let colorValue = sample[i] * 255 / 3;
                        // console.log(colorValue);
                        ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                        ctx.fillRect(10*x, 10*y, 10, 10);
                    }
                }
            }
        ]
    },
    {
        type: CommandType.COMMAND,
        name: ["gram"],
        expected: [
            {
                params: [],
                description: "Trains a model using the default settings.",
                callback: async () => {
                    let c = document.getElementById("myCanvas") as any;
                    let ctx = c.getContext("2d");

                    console.log(ctx);

                    let obj = this;

                    let size = 200;

                    let interval = setInterval(function() {

                        if ( !obj.simulation.active ) {
                            clearInterval(interval);
                        }

                        let data = obj.simulation.get(size)
                        .slice(0, 3);


                        let inputs = data.map(channel => obj.sps.generateGramianAngularFields(channel) )

                        for ( let y=0; y<size; y++ ) {
                            for ( let x=0; x<size; x++ ) {
                                ctx.beginPath();
                                let color = `rgb(${255*(1+inputs[0][y][x])}, ${255*(1+inputs[1][y][x])}, ${255*(1+inputs[2][y][x])})`;
                                ctx.fillStyle = color;

                                // console.log(color)

                                let unit = 300/size;
                                ctx.fillRect(x*unit, y*unit, unit, unit);
                            }
                        }
                    }, 6);

                    

                    

                    

                    // for ( let i=0; i<128*128; i++ ) {
                    //     let y = Math.floor(i / 36);
                    //     let x = i % 36;

                    //     // console.log(x, y);

                    //     ctx.beginPath();
                    //     // ctx.lineWidth = "6";
                    //     // ctx.strokeStyle = "red";
                    //     let colorValue = sample[i] * 255 / 3;
                    //     // console.log(colorValue);
                    //     ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                        
                    // }
                }
            }
        ]
    },
  
  
    // Remote Functions
    
  ];
}

export enum CommandType {
  "COMMAND" = 0,
  "NAMESPACE"
}

export interface CommandNameSpaceInterface {
  type: CommandType.NAMESPACE,
  name: string[],
  dir: CommandBranchInterface[],
}

export interface CommandMethodInterface {
  type: CommandType.COMMAND,
  name: string[],
  expected: CommandParameterInterface[]
}

export type CommandBranchInterface = CommandNameSpaceInterface | CommandMethodInterface;

// export interface ExecutableFunction 

export interface CommandParameterInterface {
  params: string[],
  description: string,
  callback: {
      (param: any): void;
  },
  warning?: string
}


