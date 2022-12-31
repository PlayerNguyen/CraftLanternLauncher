import { IpcMainEvent, IpcMainInvokeEvent } from "electron";

export interface IpcMainListener {
  name: string;
  listen: (event: any, ...args: any[]) => any | void;
}

export abstract class IpcMainSendListener implements IpcMainListener {
  abstract name: string;
  abstract listen: (event: IpcMainEvent, ...args: any[]) => void;
}

export abstract class IpcMainInvokeListener implements IpcMainListener {
  abstract name: string;
  abstract listen: (event: IpcMainInvokeEvent, ...args: any[]) => any;
}
