import { rmSync } from "fs";
import { mkdirSync } from "fs";
import { existsSync } from "fs";
import { getApplicationDataPath } from "../../src/electron/AssetResolver";
before(() => {
  /**
   * Requires environment variables for all test suites
   */
  if (!existsSync(getApplicationDataPath())) {
    mkdirSync(getApplicationDataPath(), { recursive: true });
  }
});

after(() => {
  /**
   * Clean up test code here
   */
  if (existsSync(getApplicationDataPath())) {
    rmSync(getApplicationDataPath(), { force: true, recursive: true });
  }
});
