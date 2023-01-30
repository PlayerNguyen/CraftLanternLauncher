import chalk from "chalk";
import fs from "fs";
import path from "path";
import { getApplicationDataPath } from "../../../src/electron/AssetResolver";
import { isWindows } from "./../../../src/electron/utils/Platform";

export function getTestOutputDirectory() {
  const _output = path.join(
    isWindows() ? getApplicationDataPath() : process.cwd(),
    process.env.TEST_OUTPUT_DIRECTORY || "test_output"
  );

  if (!fs.existsSync(_output)) {
    console.log(
      chalk.green(`Generating test output directory ${chalk.gray(_output)}`)
    );
    fs.mkdirSync(_output, { recursive: true });
  }

  return _output;
}

export function getTestInputAssetDirectory() {
  return path.resolve(`test`, `unit`, `assets`);
}
