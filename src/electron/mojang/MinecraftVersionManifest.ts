import fs from "fs";
import { getManifestVersionV2Url } from "./MojangUrl";
import { getVersionManifestPath } from "../AssetResolver";
import needle from "needle";

export interface LatestMinecraftVersion {
  release: string;
  snapshot: string;
}

export interface MinecraftVersion {
  id: string;
  type: "release" | "snapshot";
  url: URL;
  time: Date;
  releaseTime: Date;
  sha1: string;
  complianceLevel: 1 | 0;
}

export interface VersionManifestResponse {
  latest: LatestMinecraftVersion;
  versions: [MinecraftVersion];
}

export async function fetchMinecraftVersionManifest(): Promise<VersionManifestResponse> {
  return (await needle("get", await getManifestVersionV2Url())).body;
}

export class MinecraftManifestStorage {
  private static manifest: VersionManifestResponse | undefined;
  private static versionMap: Map<String, MinecraftVersion> = new Map();

  public static async getManifest(): Promise<VersionManifestResponse> {
    // If the manifest is not found, create a new one from
    //   manifest server api, then store it from cache
    if (!this.manifest) {
      this.manifest = await this.updateManifest();
    }

    return this.manifest;
  }

  private static async updateManifest() {
    try {
      console.log(
        `Fetching minecraft manifest version from ${await getManifestVersionV2Url()}`
      );

      let updatedManifest = await fetchMinecraftVersionManifest();

      // Load the map
      this.loadVersionMap(updatedManifest);

      // Write into disk
      fs.writeFileSync(
        getVersionManifestPath(),
        JSON.stringify(updatedManifest)
      );
      // Update it into manifest
      return updatedManifest;
    } catch (err) {
      console.log(
        `Getting version manifest from local disk at path ${getVersionManifestPath()}`
      );
      // If cannot fetch, trying to get from local store
      if (!fs.existsSync(getVersionManifestPath())) {
        throw new Error("Unable to resolve/load manifest [no more source].");
      }

      // Load from disk
      const diskVersionManifest = JSON.parse(
        fs.readFileSync(getVersionManifestPath(), "utf-8")
      ) as VersionManifestResponse;

      this.loadVersionMap(diskVersionManifest);

      return diskVersionManifest;
    }
  }

  private static loadVersionMap(manifest: VersionManifestResponse): void {
    // O(n) to update the map
    for (let version of manifest.versions) {
      this.versionMap.set(version.id, version);
    }
  }

  /**
   * Get a version using its id
   *
   * @param id minecraft version id
   * @returns the version which respect to the id, undefined otherwise
   */
  public static getVersionFromId(id: string): MinecraftVersion | undefined {
    const versionItem = this.versionMap.get(id);
    return versionItem;
  }

  public static async getLatestReleaseVersion() {
    const latestVersionId = await this.manifest?.latest.release;
    if (!latestVersionId) {
      throw new Error("The manifest file was not updated");
    }
    return this.getVersionFromId(latestVersionId);
  }
}
