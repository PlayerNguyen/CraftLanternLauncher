import { rimraf } from "rimraf";
import { existsSync } from "fs";
import path from "path";
import { Download } from "./../../src/electron/download/download";
import { expect } from "chai";
import {
  getGameAssetChildDirectoryFromHash,
  getGameAssetUrlFromHash,
} from "../../src/electron/mojang/GameAssetIndex";
import { getTestOutputDirectory } from "./utils/file";

describe(`getGameAssetUrlFromHash`, () => {
  it(`should return a url with first 2 characters of the hash, and the true hash`, () => {
    expect(
      getGameAssetUrlFromHash(`bdf48ef6b5d0d23bbb02e17d04865216179f510a`)
    ).to.be.eq(
      `https://resources.download.minecraft.net/bd/bdf48ef6b5d0d23bbb02e17d04865216179f510a`
    );
  });
  it(`should download the resource with valid hash`, (done) => {
    const hashOfItem = `bdf48ef6b5d0d23bbb02e17d04865216179f510a`;
    const downloadPath = path.resolve(
      getTestOutputDirectory(),
      getGameAssetChildDirectoryFromHash(hashOfItem)
    );
    const promise: Promise<void> = new Promise<void>((resolve, reject) => {
      const url = getGameAssetUrlFromHash(hashOfItem);
      const download: Download = new Download({
        url,
        path: downloadPath,
        hash: {
          algorithm: "sha1",
          value: hashOfItem,
        },
      });

      download.start({ mkdirIfNotExists: true });
      download.on("error", (error) => {
        reject(error);
      });

      download.on("done", () => {
        resolve();
      });
    });

    promise
      .then(() => {
        // Assertion
        expect(existsSync(downloadPath)).to.be.true;
      })
      .then(() => {
        // Clean up
        rimraf.sync(
          path.dirname(getGameAssetChildDirectoryFromHash(hashOfItem))
        );
      })
      .then(done)
      .catch(done);
  });
});
