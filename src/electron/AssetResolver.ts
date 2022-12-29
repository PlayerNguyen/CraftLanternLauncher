import path from "path";
import { app } from "electron";
import { getApplicationShortName } from "./Application";

function getAppPath() {
  return path.resolve(app.getAppPath());
}

function getApplicationDataPath() {
  return path.resolve(app.getPath("appData"), getApplicationShortName());
}

export { getAppPath, getApplicationDataPath };
