import { ipcMain } from "electron";
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

  public register(listener: IpcMainListener) {
    this.listeners.push(listener);
    /**
     * Default registry
     *
     */
    this.listeners.push(...getStdListeners());
  }

  public subscribe() {
    for (let listener of this.listeners) {
      if (listener instanceof IpcMainInvokeListener) {
        ipcMain.handle(listener.name, listener.listen);
      } else if (listener instanceof IpcMainSendListener) {
        ipcMain.on(listener.name, listener.listen);
      } else {
        throw new Error("Invalid listener type");
      }
    }
  }
}

export function getStdListeners(): IpcMainListener[] {
  return [
    new InvokeGetProfileListener(),
    new InvokeAddProfileListener(),
    new InvokeGetConfigListener(),
  ];
}
