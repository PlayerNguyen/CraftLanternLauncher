import {
  MinecraftManifestStorage,
  VersionManifestResponse,
} from "./../../src/electron/mojang/MinecraftVersionManifest";
import { expect } from "chai";

describe("MinecraftManifestStorage", () => {
  /**
   * Load the storage
   */
  beforeEach((done) => {
    MinecraftManifestStorage.getManifest().then(
      (versionManifest: VersionManifestResponse) => {
        expect(versionManifest).not.to.be.empty;

        done();
      }
    );
  });
  it("Storage has already loaded when access", async function () {
    // Getter from storage must faster than 100 milliseconds
    this.timeout(100);
    const storage = await MinecraftManifestStorage.getManifest();
    expect(storage).to.not.be.empty;
    expect(storage).to.have.property("latest").and.to.not.be.empty;
    expect(storage).to.have.property("versions").and.to.not.be.empty;
  });
});
