import { PathLike } from "fs";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import unzip from "unzipper";
import tar from "tar";
import fs from "fs";

/**
 * Extract a file .tar.gz extension. Useful for adoptium binary in Linux / MacOS system.
 *
 * @param filePath a file path to extract .tar.gz file
 * @param parentOutput an output directory which contains all directories and files
 */
export function extractTarGzip(filePath: PathLike, parentOutput: PathLike) {
  return new Promise<void>((res, rej) => {
    // If the archive file is not exist
    if (!existsSync(filePath)) {
      return rej(new Error(`File is not existed ${filePath}`));
    }

    // If parent output directory is not exist
    if (!existsSync(parentOutput)) {
      return rej(new Error(`Directory is not existed ${parentOutput}`));
    }

    const renderStream = fs.createReadStream(filePath).pipe(
      tar.x({
        C: parentOutput.toString(),
      })
    );
    renderStream
      .on(`end`, () => {
        res();
      })
      .on("error", (error) => rej(error));
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
