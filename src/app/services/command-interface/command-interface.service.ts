import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
// import { DatabaseService } from './database.service';
// import { SignalProcessingService } from './signal-processing.service';
import { tap, map } from 'rxjs/operators';
import { DatabaseService } from '../database/database.service';
import { SignalProcessingService } from '../signal-processing/signal-processing.service';

@Injectable({
  providedIn: 'root'
})
export class CommandInterfaceService {

  

  constructor(
    private db: DatabaseService,
    private sps: SignalProcessingService
  ) { }

  // getStatus(): Promise<boolean> {
  //   return Promise.resolve(true);
  // }

  sendRemoteCommand(command: string) {
    from(this.db.set("commands", {
      request: command.toLowerCase(),
      response: {
        log: [],
        status: ResponseCodes.PENDING,
        data: "",
      }
    }))
    // .pipe(
    //   map()
    // )
    return this.db.bind("commands/response")
      // .pipe(
      //   tap(result => {
          
      //   })
      // )
  }

}


export enum ResponseCodes {
  "OK" = 1,
  "PENDING",
  "ERROR",
  "TIMEOUT"
}

