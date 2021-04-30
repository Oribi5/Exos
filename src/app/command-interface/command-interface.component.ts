import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { CommandInterfaceService, ResponseCodes } from '../services/command-interface/command-interface.service';
import { DatabaseService } from '../services/database/database.service';
import { LoggerService } from '../services/logger/logger.service';
import { MachineLearningService } from '../services/machine-learning/machine-learning.service';
import { SignalProcessingService } from '../services/signal-processing/signal-processing.service';

@Component({
  selector: 'command-interface',
  templateUrl: './command-interface.component.html',
  styleUrls: ['./command-interface.component.css']
})
export class CommandInterfaceComponent implements OnInit {

  // @ViewChild('logger') loggerElement: any;

  initString: string = "EXO-S | Virtual Command System.";

  logs: string[] = [this.initString];
  cmdLog: string[] = [];
  cmd: string = "";

  commandIndex: number;

  localCommandTree: CommandBranchInterface[];

  constructor(
    private cis: CommandInterfaceService,
    private sps: SignalProcessingService,
    private mls: MachineLearningService,
    private logger: LoggerService
  ) {
    this.commandIndex = -1;
    this.localCommandTree = [];
  }

  ngOnInit(): void {

    // Use index of array to indicate the number of parameters
    
    this.localCommandTree = [
      {
        type: CommandType.COMMAND,
        methods: ["led"],
        expected: [
          {
            name: "state",
            numberOfParameters: 1,
            description: "Sets the BUILTIN_LED state of the ESP8266 module ['e.g. on, 1, true'].", 
          }
        ]
      },
      {
        type: CommandType.COMMAND,
        methods: ["power"],
        expected: [
          {
            name: "", 
            numberOfParameters: 0,
            description: "Returns power state.", 
          },
          {
            name: "state", 
            numberOfParameters: 1,
            description: "Sets the BUILTIN_LED state of the ESP8266 module ['e.g. active, 1,'].", 
          }
        ]
      },
      {
        type: CommandType.COMMAND,
        methods: ["database", "db"],
        expected: [
          {
            name: "init", 
            numberOfParameters: 1,
            description: "Initialised Wifi - Firebase Connection (Note this is automatic).", 
            warning: "Connection will temporarily be lost.",
          },
          {
            name: "status", 
            numberOfParameters: 1,
            description: "Returns Connection Status.", 
          },
          {
            name: "ip", 
            numberOfParameters: 1,
            description: "Returns Connection IP Address.", 
          },
          {
            name: "disconnect", 
            numberOfParameters: 1,
            description: "Disconnects ESP8266 from current wifi connection.", 
            warning: "You will no longer be able to remotely control the EXO-S System until ESP8266 system restart.",
          }
        ]
      },

    ];
    
  }

  reset() {
    this.cmd = "";
    this.logs = [this.initString];
  }

  onKeyPress(event: KeyboardEvent) {
    switch(event.key) {
      case "Enter": 
        this.execute();
        break;

      case "Tab": 
        event.preventDefault();
        this.autoFill();
        break;

      case "ArrowUp": 
        this.incrementLine(1);
        break;

      case "ArrowDown":
        this.incrementLine(-1);
        break;
    }
  }

  autoFill(): void {
    if ( this.cmd == "" ) return;

    let partialStringMatch = (partialString: string, fullString: string): boolean => {
      return partialString === fullString.substr(0, partialString.length);
    }


    let possibilities = this.localCommandTree
      .reduce((acc, branch) => {
        return [...acc, ...branch.methods];
      }, [] as string[])
      .filter(str => partialStringMatch(this.cmd, str))
      .sort((str1, str2) => str1.length - str2.length);
    
    if ( possibilities.length > 0 ) {
      this.cmd = possibilities[0];
    }
  }

  incrementLine(incrementer: number): void {

    this.commandIndex += incrementer;
    this.commandIndex = Math.max(Math.min(this.commandIndex, this.cmdLog.length-1), -1);

    if ( this.commandIndex == -1 ) {
      this.cmd = "";
    } else {
      this.cmd = this.cmdLog[this.cmdLog.length - this.commandIndex -1];
    }
  }

  execute(): void {

    var c = document.getElementById("myCanvas") as any;
        var ctx = c.getContext("2d");

    this.commandIndex = -1;

    if ( this.cmd == "clear" ) {
      this.logs = [];
      this.reset();
      return;
    }

    console.log(this.cmd);
    this.logs.push(this.cmd);
    this.cmdLog.push(this.cmd);

    let commandArray = this.cmd.split(" ");
    if ( commandArray.length > 1 && commandArray[0] == "remote" ) {
      commandArray.shift();
      let remoteCommand = commandArray.join(" ");
      let cmdObservable = this.cis.sendRemoteCommand(remoteCommand)

      this.log(cmdObservable);
    }

    if ( commandArray.length >= 1 && commandArray[0] == "load" ) {
      let ids = commandArray.splice(1, commandArray.length)
      for ( let id of ids ) {
        console.log(id);
        this.sps.preprocessesData(id, this.mls, ctx);
      }
    }

    if ( commandArray.length >= 1 && commandArray[0] == "train" ) {
      if ( commandArray.length >= 2 ) {
        // this.mls.fullTrainingSequence(commandArray[1] == "fromLoad");
      } else {
        
        this.mls.fullTrainingSequence(ctx);
      }
      
    }
      
    this.cmd = "";
  }

  log(logger: Observable<any>): void {
    let logSubscription = logger.subscribe(response => {
      if ( response.status == ResponseCodes.OK ) {
        this.logs.push(`<i class="log-text end-log green-text">Success</i> | Return Response: ${response.data}<br><i class="hidden-text log-text">.</i>`);

        logSubscription.unsubscribe();
        clearTimeout(timer);
      }
      if ( response.status == ResponseCodes.ERROR ) {
        this.logs.push(`<i class="log-text end-log red-text">Error | ErrorCode: "${response.data}"</i><br><i class="hidden-text log-text">.</i>`);

        logSubscription.unsubscribe();
        clearTimeout(timer);
      }
    });
    let obj = this;
    // 10 seconds to respond
    let timer = setTimeout(function() {
      obj.logs.push(`<i class="log-text end-log yellow-text">Timeout Error. The ESP8266 Module may have disconnected..</i><br> `);
      logSubscription.unsubscribe();
    }, 10000)

    // timer.unref().
  }

  executeLocalFunctions(): void {
    
  }

}

export enum CommandType {
  "COMMAND" = 0,
  "NAMESPACE"
}

// export interface CommandTreeInterface {

// }

export interface CommandBranchInterface {
  type: CommandType,
  methods: string[],
  expected: CommandParameterInterface[]
}

export interface CommandParameterInterface {
  name: string,
  numberOfParameters: number,
  description: string,
  warning?: string
}