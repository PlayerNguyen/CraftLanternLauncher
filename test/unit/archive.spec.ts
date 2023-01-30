import { expect } from "chai";
import { existsSync, readFileSync } from "fs";
import { extractTarGzip, extractZip } from "../../src/electron/archive";
import {
  getTestInputAssetDirectory,
  getTestOutputDirectory,
} from "./utils/file";
import path from "path";
import { rmNonEmptyDir } from "../../src/electron/FileSystem";

after(() => {
  rmNonEmptyDir(path.join(getTestInputAssetDirectory(), `archive`));
});
describe(`.tar.gz extension test`, () => {
  it(`should throws with non-exist file`, (done) => {
    extractTarGzip("", getTestOutputDirectory()).catch((err: Error) => {
      expect(err).not.to.be.undefined;
      expect(err.message).to.include("File is not exist");
      done();
    });
  });

  it(`should extract a tar gz contains folder inside`, (done) => {
    extractTarGzip(
      path.join(getTestInputAssetDirectory(), `archive.tar.gz`),
      path.join(getTestInputAssetDirectory())
    )
      .then(() => {
        expect(
          existsSync(path.resolve(getTestInputAssetDirectory(), `archive`))
        ).to.be.true;
        expect(
          existsSync(
            path.resolve(getTestInputAssetDirectory(), `archive`, `file`)
          )
        ).to.be.true;
        expect(
          readFileSync(
            path.resolve(getTestInputAssetDirectory(), `archive`, `file`),
            "utf-8"
          )
        ).to.be.eq("1");
      })
      .then(() => {
        rmNonEmptyDir(path.join(getTestInputAssetDirectory(), `archive`));
        done();
      })
      .catch(done);
  });
});

describe(`zip extract test`, () => {
  it(`should extract zip files / directories`, (done) => {
    extractZip(
      path.join(getTestInputAssetDirectory(), `archive.zip`),
      path.join(getTestInputAssetDirectory())
    )
      .then(() => {
        expect(
          existsSync(path.resolve(getTestInputAssetDirectory(), "archive"))
        );
        expect(
          existsSync(
            path.resolve(getTestInputAssetDirectory(), `archive`, `file`)
          )
        ).to.be.true;
        expect(
          readFileSync(
            path.resolve(getTestInputAssetDirectory(), `archive`, `file`),
            "utf-8"
          )
        ).to.be.eq("1");
        done();
      })
      .catch(done);
  });
});
