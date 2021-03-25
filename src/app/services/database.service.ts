import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private database: AngularFireDatabase
  ) {}

  get(path: string) {
    return this.database.database.ref(path).get();
  }

  bind(path: string) {
    return this.database.object(path).valueChanges();
  }

  set(path: string, obj: any) {
    return this.database.object(path).set(obj);
  }

  update() {

  }
}
