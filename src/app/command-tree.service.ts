import { Injectable } from '@angular/core';
import { CommandInterfaceService } from './services/command-interface/command-interface.service';

@Injectable({
  providedIn: 'root'
})
export class CommandTreeService {

  constructor(
    public cis: CommandInterfaceService
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
        dir: [],
    },
    {
        type: CommandType.NAMESPACE,
        name: ["simulate", "sim"],
        dir: [],
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


