import needle from "needle";
import { expect } from "chai";
import {
  createMd5Stream,
  createSha1HashStream,
  createSha256Stream,
} from "../../src/electron/security/Security";

/**
 *
 */
describe(`Sha1`, () => {
  it(`true value check for sha1`, function (done) {
    this.timeout(5000);

    let inBuffer = needle.get(
      "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
    );
    let hash = createSha1HashStream(inBuffer);

    /**
     * The buffer must be close before using
     */
    inBuffer.on("close", () => {
      expect(hash.digest("hex")).to.be.eq(
        `5c685c5ffa94c4cd39496c7184c1d122e515ecef`
      );
      done();
    });
  });
});

describe("sha256", () => {
  it("create a valid hash from download stream", function (done) {
    this.timeout(5000);
    let inBuffer = needle.get(
      "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
    );
    let hash = createSha256Stream(inBuffer);

    inBuffer.on(`close`, () => {
      expect(hash.digest("hex")).to.eq(
        `830bfd639c8db49236bbd8e45d3a2b8c96c56ff654a10118654958a6235d4c44`
      );

      done();
    });
  });
});

describe("md5", () => {
  it("create a valid hash from download stream", function (done) {
    this.timeout(5000);
    let inBuffer = needle.get(
      "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
    );
    let hash = createMd5Stream(inBuffer);

    inBuffer.on(`close`, () => {
      expect(hash.digest("hex")).to.eq(`fc1420e3182dd32b4df9933f810ebebb`);

      done();
    });
  });
});
