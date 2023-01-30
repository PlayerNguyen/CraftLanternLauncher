import chalk from "chalk";
import { mkdirSync } from "fs";
import { existsSync } from "fs";
import rimraf from "rimraf";
import { getApplicationDataPath } from "../../src/electron/AssetResolver";
import { getTestOutputDirectory } from "./utils/file";
before(() => {
  /**
   * Requires environment variables for all test suites
   */
  if (!existsSync(getApplicationDataPath())) {
    mkdirSync(getApplicationDataPath(), { recursive: true });
  }

  if (!existsSync(getTestOutputDirectory())) {
    mkdirSync(getTestOutputDirectory(), { recursive: true });
  }
});

after(() => {
  /**
   * Clean up test code here
   */
  if (existsSync(getApplicationDataPath())) {
    rimraf.sync(getApplicationDataPath());
  }

  console.log(
    chalk.green(
      `Cleaning test output directory: ${getTestOutputDirectory()}...`
    )
  );
  if (existsSync(getTestOutputDirectory())) {
    rimraf.sync(getTestOutputDirectory());
  }
});
