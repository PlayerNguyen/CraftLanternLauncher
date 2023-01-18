import chalk from "chalk";
import fs from "fs";

export function getTestOutputDirectory() {
  const _output = process.env.TEST_OUTPUT_DIRECTORY || ".test_output";

  if (!fs.existsSync(_output)) {
    console.log(
      chalk.green(`Generating test output directory ${chalk.gray(_output)}`)
    );
    fs.mkdirSync(_output);
  }

  return _output;
}
