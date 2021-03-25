import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ping: number = 0;

  constructor(
    private db: DatabaseService
  ) {

  }

  ngOnInit(): void {
    console.log("Initialised")
    this.db.bind("ping")
      .subscribe(ping => {
        console.log(ping);
      })
      
  }

}
