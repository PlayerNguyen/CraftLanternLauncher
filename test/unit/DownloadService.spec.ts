/**
 *  The test will fail if (rarely) Minecraft server is down
 */
import { expect } from "chai";
import path from "path";
import { DownloaderService } from "./../../src/electron/download/DownloaderService";
import fs from "fs";
import {
  DownloadProgress,
  HashableDownloadItem,
} from "../../src/electron/download/Downloader";

let TEST_OUTPUT_DIRECTORY = process.env.TEST_OUTPUT_DIRECTORY || ".test_output";

describe("DownloadService", () => {
  let downloadService = new DownloaderService();

  beforeEach(() => {
    if (!fs.existsSync(TEST_OUTPUT_DIRECTORY)) {
      fs.mkdirSync(TEST_OUTPUT_DIRECTORY, { recursive: true });
    }
    downloadService = new DownloaderService();
  });

  afterEach(() => {
    downloadService.clearItems();
    /**
     * Clear item
     */

    fs.readdirSync(TEST_OUTPUT_DIRECTORY).forEach((item) => {
      if (fs.existsSync(item)) {
        fs.rmSync(item);
      }
    });
    expect(downloadService.getCurrentDownloadItem()).to.be.undefined;
    expect(downloadService.getItemQueue().size).to.eq(0);
  });

  after(() => {
    fs.rmSync(TEST_OUTPUT_DIRECTORY, { force: true, recursive: true });
    expect(fs.existsSync(TEST_OUTPUT_DIRECTORY)).to.be.false;
  });

  it(`Download with empty queue`, () => {
    expect(() => {
      downloadService.downloadItems();
    }).to.throws("The download queue is empty. Must add the item first");
  });

  it(`Download game library test with SHA1`, function async(done) {
    this.timeout(10000);

    /**
     * Dummy test from
     * url: https://piston-meta.mojang.com/v1/packages/6607feafdb2f96baad9314f207277730421a8e76/1.19.3.json
     *
     * libraries.
     * {"downloads":{"artifact":{"path":"commons-codec/commons-codec/1.15/commons-codec-1.15.jar","sha1":"49d94806b6e3dc933dacbd8acb0fdbab8ebd1e5d","size":353793,"url":"https://libraries.minecraft.net/commons-codec/commons-codec/1.15/commons-codec-1.15.jar"}},"name":"commons-codec:commons-codec:1.15"}
     */
    let mockPromise: Promise<HashableDownloadItem[]> = new Promise(
      (resolve, reject) => {
        for (let i = 0; i < 3; i++) {
          downloadService.addItem({
            path: path.resolve(
              TEST_OUTPUT_DIRECTORY,
              `commons-codec-1.15-${i}.jar`
            ),
            url: "https://libraries.minecraft.net/commons-codec/commons-codec/1.15/commons-codec-1.15.jar",
            size: 353793,
            hash: "49d94806b6e3dc933dacbd8acb0fdbab8ebd1e5d",
          });
        }

        downloadService.downloadItems({
          createDirIfEmpty: true,
        });

        downloadService.on("completed", (downloadedItem) => {
          resolve(downloadedItem as HashableDownloadItem[]);
        });

        downloadService.on("corrupted", (item) =>
          reject(
            new Error(`Item corrupted somewhere, check logs. Items ${item}`)
          )
        );
        downloadService.on("error", (err) => reject(err));
      }
    );

    mockPromise
      .then((downloadedItem: HashableDownloadItem[]) => {
        expect(downloadedItem).lengthOf(3);

        // Assert whenever all items are download and exists
        expect(
          [...downloadedItem]
            .map((item) => fs.existsSync(item.path))
            .every((v) => v === true)
        ).to.be.true;

        // Successfully passed all test cases
        done();
      })
      .catch(done);
  });

  it(`Prepare items`, () => {
    expect(downloadService.getCurrentDownloadItem()).to.be.undefined;
    expect(downloadService.getItemQueue().hasNext()).to.be.false;
    expect(downloadService.getItemQueue().size).to.eq(0);

    downloadService.addItem({
      path: path.resolve(TEST_OUTPUT_DIRECTORY, `commons-codec-1.15.jar`),
      url: "https://libraries.minecraft.net/commons-codec/commons-codec/1.15/commons-codec-1.15.jar",
      hash: "49d94806b6e3dc933dacbd8acb0fdbab8ebd1e5d",
    });

    expect(downloadService.getItemQueue().hasNext()).to.be.true;
    expect(downloadService.getItemQueue().size).to.eq(1);

    // downloadService.addItem()
  });

  it(`Estimate length of unknown-size packets`, (done) => {
    let promise: Promise<void> = new Promise((resolve) => {
      downloadService.addItem({
        path: path.resolve(TEST_OUTPUT_DIRECTORY, `commons-codec-1.15.jar`),
        url: "https://libraries.minecraft.net/commons-codec/commons-codec/1.15/commons-codec-1.15.jar",
        hash: "49d94806b6e3dc933dacbd8acb0fdbab8ebd1e5d",
      });

      downloadService.downloadItems({
        createDirIfEmpty: true,
        ignoreChecksum: true,
      });

      downloadService.on("completed", () => resolve());
    });

    promise
      .then(() => {
        expect(
          fs.existsSync(
            path.resolve(TEST_OUTPUT_DIRECTORY, `commons-codec-1.15.jar`)
          )
        ).to.be.true;
        done();
      })
      .catch(done);
  });

  it(`On: progress`, function async(done) {
    this.timeout(5000);
    // Prepare items before download with 2 items
    for (let i = 0; i < 2; i++) {
      downloadService.addItem({
        path: path.resolve(
          TEST_OUTPUT_DIRECTORY,
          `commons-codec-1.15-${i}.jar`
        ),
        url: "https://libraries.minecraft.net/commons-codec/commons-codec/1.15/commons-codec-1.15.jar",
        size: 353793,
        hash: "49d94806b6e3dc933dacbd8acb0fdbab8ebd1e5d",
      });
    }

    let mockPromiseTest: Promise<{
      item: HashableDownloadItem;
      progress: DownloadProgress;
    }> = new Promise((resolve, reject) => {
      downloadService.on("progress", (item, progress) => {
        resolve({ item, progress });
      });
      downloadService.on("error", (err) => reject(err));
      downloadService.downloadItems({ createDirIfEmpty: true });
    });

    mockPromiseTest
      .then(({ item, progress }) => {
        expect(typeof progress.currentSize).to.eq("number");
        expect(typeof progress.currentSize).to.eq("number");
        expect(progress.actualSize).to.eq(progress.currentSize);
        expect(item).not.to.be.undefined;

        done();
      })
      .catch(done);
  });
});
