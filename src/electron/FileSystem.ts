import rimraf from "rimraf";
import { RimrafOptions } from "rimraf/dist/cjs/src/index";
import { spawnSync } from "child_process";
import { PathLike } from "fs";
import { isLinux, isMacOs, isWindows } from "./utils/Platform";

export function openDirFromFileBrowser(path: string | PathLike) {
  let execCommand = "";
  if (isMacOs()) {
    execCommand += "open";
  } else if (isWindows()) {
    execCommand += "explorer";
  } else if (isLinux()) {
    execCommand += "xdg-open";
  } else {
    throw new Error("Unsupported operating system.");
  }

  spawnSync(execCommand, [path.toString()]);
}

export function rmNonEmptyDir(
  path: string | string[],
  options?: RimrafOptions
) {
  if (isWindows()) {
    rimraf.windowsSync(path, options);
  } else {
    rimraf.sync(path, options);
  }
}
