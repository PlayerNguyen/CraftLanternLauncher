import needle from "needle";
import { expect } from "chai";
import { createSha1HashStream } from "../../src/electron/security/Security";

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
