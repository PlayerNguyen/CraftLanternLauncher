import { IpcMainInvokeEvent } from "electron";
import { ConfigurationStatic } from "../configurations/Configuration";
import { IpcMainInvokeListener, IpcMainListener } from "./IpcMainListener";

export class InvokeGetConfigListener implements IpcMainInvokeListener {
  name = "config:get";
  type = "invoke";
  
  listen = (_event: IpcMainInvokeEvent, ...args: any[]) => {
    if (!ConfigurationStatic.getMemoryConfiguration().has(args[0])) {
      throw new Error(
        `Config not found ${args} [configuration has not been loaded]`
      );
    }

    return ConfigurationStatic.getMemoryConfiguration().get(args[0]);
  };
}
