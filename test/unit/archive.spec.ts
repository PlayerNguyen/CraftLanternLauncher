import { expect } from "chai";
import { existsSync, readFileSync, rmSync } from "fs";
import { extractTarGzip, extractZip } from "../../src/electron/archive";
import {
  getTestInputAssetDirectory,
  getTestOutputDirectory,
} from "./utils/file";
import path from "path";

after(() => {
  rmSync(path.resolve(getTestInputAssetDirectory(), `archive`), {
    force: true,
    recursive: true,
  });
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
      path.resolve(getTestInputAssetDirectory(), `archive.tar.gz`),
      path.resolve(getTestInputAssetDirectory())
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
        rmSync(path.resolve(getTestInputAssetDirectory(), `archive`), {
          force: true,
          recursive: true,
        });
        done();
      })
      .catch(done);
  });
});

describe(`zip extract test`, () => {
  it(`should extract zip files / directories`, (done) => {
    extractZip(
      path.resolve(getTestInputAssetDirectory(), `archive.zip`),
      path.resolve(getTestInputAssetDirectory())
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
