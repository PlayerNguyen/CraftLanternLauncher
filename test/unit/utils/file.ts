import chalk from "chalk";
import fs from "fs";
import path from "path";

export function getTestOutputDirectory() {
  const _output = path.resolve(
    process.cwd(),
    process.env.TEST_OUTPUT_DIRECTORY || ".test_output"
  );

  if (!fs.existsSync(_output)) {
    console.log(
      chalk.green(`Generating test output directory ${chalk.gray(_output)}`)
    );
    fs.mkdirSync(_output);
  }

  return _output;
}

export function getTestInputAssetDirectory() {
  return path.resolve(`test`, `unit`, `assets`);
}
