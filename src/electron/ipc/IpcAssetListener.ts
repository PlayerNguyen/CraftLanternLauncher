import { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { Download } from "../download/download";
import { GameVersion } from "../mojang/GameVersion";
import { IpcMainInvokeListener } from "./IpcMainListener";

export class SendAssetDownloadListener implements IpcMainInvokeListener {
  name = "asset:download";
  type = "send";
  listen = (_event: IpcMainInvokeEvent, ...args: any[]) => {
    let targetDownloadVersion = args[0];
    // Starting create download version
    console.log(`Starting to download asset ${targetDownloadVersion}`);

    new GameVersion();

    let _download = new Download();
    _download.on("progress", () => {
      // _event.
    });
  };
}
