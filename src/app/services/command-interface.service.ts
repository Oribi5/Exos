import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class CommandInterfaceService {

  constructor(
    private db: DatabaseService
  ) { }

  getStatus(): Promise<boolean> {
    return Promise.resolve(true);
  }

  sendCommand(command: string) {
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
  }

}


export enum ResponseCodes {
  "OK" = 1,
  "PENDING",
  "ERROR",
  "TIMEOUT"
}

