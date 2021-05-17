import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  PREFIX = "exos";

  constructor() {}

  get(key, defaultValue: any): any {
    console.log("GETTING KEY!")
    let stored = localStorage.getItem(key);

    console.log(stored)

    if ( stored != null )
      return stored;
    
    this.set(key, defaultValue);
    return defaultValue;
  }

  set(key, value): any {
    localStorage.setItem(`${this.PREFIX}-${key}`, value);
  }

  clear(): void {
    localStorage.clear();
  }
}
