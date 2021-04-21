import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database/database.service';

@Component({
  selector: 'connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.css']
})
export class ConnectionStatusComponent implements OnInit {

  connectionStatus: boolean;
  lastPingTime: number = 0;

  pingTimeout: any;
  PING_INTERVAL_DURATION: number = 6000;

  constructor(
    private db: DatabaseService,
  ) {
    this.connectionStatus = false;
    this.resetTimer();
  }

  ngOnInit(): void {

    this.db.bind("ping")
      .subscribe((ping: any) => {
        this.resetTimer();
        if ( Date.now() - ping < this.PING_INTERVAL_DURATION ) {
          this.connectionStatus = true;
        }
        
        this.lastPingTime = ping;
      });
  }

  resetTimer() {
    let obj = this;

    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(function() {
      obj.connectionStatus = false;
    }, this.PING_INTERVAL_DURATION)
  }

  setActive(status: boolean): void {
    this.connectionStatus = status;
  }
}
