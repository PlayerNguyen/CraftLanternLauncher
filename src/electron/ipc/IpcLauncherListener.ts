import { IpcMainSendListener } from "./IpcMainListener";
import { openDirFromFileBrowser } from "../FileSystem";
import { getApplicationDataPath } from "../AssetResolver";

export class IpcSendLauncherOpenDirectory extends IpcMainSendListener {
  name = "launcher:open-launcher-directory";
  type = "send";
  listen = () => {
    openDirFromFileBrowser(getApplicationDataPath());
  };
}
