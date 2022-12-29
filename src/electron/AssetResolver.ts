import path from "path";
import { app } from "electron";

function getAppPath() {
  
  return path.resolve(app.getAppPath());
}

export { getAppPath };
