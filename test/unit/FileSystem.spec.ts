import { existsSync, mkdirSync, writeFileSync } from "fs";
import { rmNonEmptyDir } from "../../src/electron/FileSystem";
import { getTestOutputDirectory } from "./utils/file";
import path from "path";
import { expect } from "chai";

describe(`rmNonEmptyDir`, () => {
  it(`should remove the directory which non-empty`, () => {
    let parentTestPath = path.join(getTestOutputDirectory(), `test`);
    // Make a directory
    mkdirSync(parentTestPath, { recursive: true });

    // Then create a file and directory inside directory
    mkdirSync(path.join(parentTestPath, "test1"), { recursive: true });
    writeFileSync(
      path.join(parentTestPath, `test1`, `text.txt`),
      "<this file should be deleted>"
    );
    writeFileSync(
      path.join(parentTestPath, `text.txt`),
      "<this file should be deleted>"
    );

    // Execute delete file
    rmNonEmptyDir(parentTestPath);

    expect(existsSync(path.join(parentTestPath, `test1`, `text.txt`))).to.be
      .false;
    expect(existsSync(path.join(parentTestPath, `text.txt`))).to.be.false;
    expect(existsSync(path.join(parentTestPath))).to.be.false;
  });
});
