import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { CommandBranchInterface, CommandMethodInterface, CommandNameSpaceInterface, CommandTreeService, CommandType } from '../command-tree.service';
import { CommandInterfaceService, ResponseCodes } from '../services/command-interface/command-interface.service';
import { DatabaseService } from '../services/database/database.service';
import { LoggerService } from '../services/logger/logger.service';
import { MachineLearningService } from '../services/machine-learning/machine-learning.service';
import { SignalProcessingService } from '../services/signal-processing/signal-processing.service';
// import { CommandBranchInterface, CommandTree } from './command-tree';

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

  // command: CommandBranchInterface[];

  constructor(
    private cis: CommandInterfaceService,
    private sps: SignalProcessingService,
    private mls: MachineLearningService,
    private logger: LoggerService,
    private commandTree: CommandTreeService
  ) {
    this.commandIndex = -1;
    // this.localCommandTree = [];

  }

  ngOnInit(): void {

    // Use index of array to indicate the number of parameters
    
    // this.localCommandTree = CommandTree;
    
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

  executeMethod(): void {
    let cmdArray = this.cmd.split(" ");
    let root = this.commandTree.CommandTree

    for ( let i=0; i<cmdArray.length; i++ ) {
      let str = cmdArray[i];
      let subDirectory = root.filter(branch => branch.name.includes(str));

      console.log(subDirectory)
      
      if ( subDirectory.length == 0) break;

      switch ( subDirectory[0].type ) {
        case CommandType.NAMESPACE: root = (subDirectory[0] as CommandNameSpaceInterface).dir; break;
        case CommandType.COMMAND: {
          let args = cmdArray.slice(i+1, cmdArray.length)
          let methods = (subDirectory[0] as CommandMethodInterface)

          // console.log("args");
          // console.log(args);
          // console.log(methods);

          let identicalMethods = methods.expected.filter(method => method.params.length == args.length);

          // console.log(identicalMethods)

          if ( identicalMethods.length != 0 )
            identicalMethods[0].callback(args);
            return;
          
          // let arguments = 
        }
      }
    }

    console.error("No method found.");

    return;
  }


  autoFill(): void {
    if ( this.cmd == "" ) return;

    //Navigate to subdirectory
    let root = this.commandTree.CommandTree
    let cmdArray = this.cmd.split(" ");
    let partialComplete = cmdArray.pop();

    // if (partialComplete.length == 0) return;

    for ( let i=0; i<cmdArray.length; i++ ) {
      let str = cmdArray[i];
      let subDirectory = root.filter(branch => branch.name.includes(str));

      console.log(subDirectory)
      
      if ( subDirectory.length == 0 && subDirectory[0].type == CommandType.NAMESPACE) return;

      root = (subDirectory[0] as CommandNameSpaceInterface).dir;

    }
    

    // Find closest partial match
    let partialStringMatch = (partialString: string, fullString: string): boolean => {
      return partialString === fullString.substr(0, partialString.length);
    }

    console.log(root);

    let possibilities = root
      .reduce((acc, branch) => {
        return [...acc, ...branch.name];
      }, [] as string[])
      .filter(str => partialStringMatch(partialComplete, str))
      .sort((str1, str2) => str1.length - str2.length);
    
    if ( possibilities.length > 0 ) {
      cmdArray.push(possibilities[0]);
      this.cmd = cmdArray.join(" ");
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

  getHelp(): void {

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

    this.executeMethod()

    // console.log(this.cmd);
    this.logs.push(this.cmd);
    this.cmdLog.push(this.cmd);

    // let commandArray = this.cmd.split(" ");

    this.cmd = "";

    return;
    // if ( commandArray.length > 1 && commandArray[0] == "remote" ) {
    //   commandArray.shift();
    //   let remoteCommand = commandArray.join(" ");
    //   let cmdObservable = this.cis.sendRemoteCommand(remoteCommand)

    //   this.log(cmdObservable);
    // }

    // if ( commandArray.length >= 1 && commandArray[0] == "load" ) {
    //   let ids = commandArray.splice(1, commandArray.length)
    //   for ( let id of ids ) {
    //     console.log(id);
    //     this.sps.preprocessesData(id, this.mls, ctx);
    //   }
    // }

    // if ( commandArray.length >= 1 && commandArray[0] == "stop" ) {
    //   this.mls.model.stopTraining = true;
    // }

    // if ( commandArray.length >= 1 && commandArray[0] == "train" ) {
    //   if ( commandArray.length >= 2 ) {
    //     // this.mls.fullTrainingSequence(commandArray[1] == "fromLoad");
    //     let name = commandArray[1];
    //     let skips = parseInt(commandArray[2]);
    //     let notes = commandArray[3];
    //     this.mls.fullTrainingSequence(name, skips, notes);

    //   } else {
        
    //     this.mls.fullTrainingSequence();
    //   }
      
    // }
      
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




