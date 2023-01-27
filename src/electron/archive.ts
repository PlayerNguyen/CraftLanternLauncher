import { PathLike } from "fs";
import { spawn } from "child_process";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from "original-fs";
import { isWindows } from "./utils/Platform";
import unzip from "unzipper";
import stream from "stream";

/**
 * Extract a file .tar.gz extension. Useful for adoptium binary in Linux / MacOS system.
 *
 * @param filePath a file path to extract .tar.gz file
 * @param parentOutput an output directory which contains all directories and files
 */
export function extractTarGzip(filePath: PathLike, parentOutput: PathLike) {
  return new Promise<void>((res, rej) => {
    if (isWindows()) {
      return rej(
        new Error(
          `Unsupported operating system. tar.gz file only support for linux / macos`
        )
      );
    }
    // If the archive file is not exist
    if (!existsSync(filePath)) {
      return rej(new Error(`File is not existed ${filePath}`));
    }

    // If parent output directory is not exist
    if (!existsSync(parentOutput)) {
      return rej(new Error(`Directory is not existed ${parentOutput}`));
    }

    let spawner = spawn("tar", [
      "-zxf",
      filePath.toString(),
      "-C",
      parentOutput.toString(),
    ]);

    spawner.on("exit", (code, _signal) => {
      if (code === 0) {
        res();
      } else {
        rej(
          new Error(`Unknown error, the system are exited with code ${code}`)
        );
      }
    });
    spawner.on("error", (err) => {
      rej(err);
    });
  });
}

export function extractZip(filePath: PathLike, parentOutput: PathLike) {
  return new Promise<void>((res, rej) => {
    if (!existsSync(filePath)) {
      return rej(`File is not exist ${filePath}`);
    }
    if (!existsSync(parentOutput)) {
      return rej(`Output directory is not exist ${parentOutput}`);
    }
    createReadStream(filePath)
      .pipe(
        unzip.Extract({
          path: parentOutput.toString(),
        })
      )
      .on("close", () => res())
      .on("error", (err) => {
        rej(err);
      });
  });
}
