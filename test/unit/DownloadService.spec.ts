import { expect } from "chai";
import path from "path";
import { DownloaderService } from "./../../src/electron/download/DownloaderService";
import fs from "fs";
import { HashableDownloadItem } from "../../src/electron/download/Downloader";

let TEST_OUTPUT_DIRECTORY = process.env.TEST_OUTPUT_DIRECTORY || ".test_output";

describe("DownloadService", () => {
  let downloadService = new DownloaderService();
  before(() => {
    if (!fs.existsSync(TEST_OUTPUT_DIRECTORY)) {
      fs.mkdirSync(TEST_OUTPUT_DIRECTORY, { recursive: true });
    }
  });
  afterEach(() => {
    downloadService.clearItems();
    expect(downloadService.getCurrentDownloadItem()).to.be.undefined;
    expect(downloadService.getItemQueue().size).to.eq(0);
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

  it(`Estimate length of packets`, () => {
    // expect(downloadService.)
  });
});
