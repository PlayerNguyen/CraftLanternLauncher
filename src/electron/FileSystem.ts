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
