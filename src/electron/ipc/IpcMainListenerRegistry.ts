import { ipcMain } from "electron";
import { SendAssetDownloadListener } from "./IpcAssetListener";
import { InvokeGetConfigListener } from "./IpcConfigListener";
import {
  IpcMainListener,
  IpcMainInvokeListener,
  IpcMainSendListener,
} from "./IpcMainListener";
import {
  InvokeAddProfileListener,
  InvokeGetProfileListener,
} from "./IpcProfileListener";

export class IpcMainListenerRegistry {
  listeners: IpcMainListener[] = [];

  constructor() {
    this.listeners.push(...getStdListeners());
  }

  public register(listener: IpcMainListener) {
    this.listeners.push(listener);
  }

  public subscribe() {
    for (let listener of this.listeners) {
      if (listener.type === "invoke") {
        ipcMain.handle(listener.name, listener.listen);
      } else if (listener.type === "send") {
        ipcMain.on(listener.name, listener.listen);
      } else {
        throw new Error(
          `Invalid listener type of ${listener.name} with type ${listener.type}`
        );
      }
    }
  }
}

export function getStdListeners(): IpcMainListener[] {
  return [
    new InvokeGetProfileListener(),
    new InvokeAddProfileListener(),
    new InvokeGetConfigListener(),
    new SendAssetDownloadListener(),
  ];
}
