import { ipcMain } from "electron";
import {
  IpcMainListener,
  IpcMainInvokeListener,
  IpcMainSendListener,
} from "./IpcMainListener";

export class IpcMainListenerRegistry {
  listeners: IpcMainListener[] = [];

  public register(listener: IpcMainListener) {
    this.listeners.push(listener);
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
