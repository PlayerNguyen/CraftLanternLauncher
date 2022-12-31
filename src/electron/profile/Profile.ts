import { MinecraftManifestStorage } from "./../mojang/MinecraftVersionManifest";
import { getProfilePath } from "../AssetResolver";
import fs from "fs";
import * as uuid from "uuid";

interface Profile {
  id: string;
  profileName: string;
  versionId: string;
}

export class ProfileStorage {
  private static profileList: Profile[];

  public static async load() {
    // Load default since has not profile file
    if (!fs.existsSync(getProfilePath())) {
      console.log(`Generating default profile`);

      // Get the latest version first
      const latestMinecraftVersion =
        await MinecraftManifestStorage.getLatestReleaseVersion();
      if (!latestMinecraftVersion) {
        throw new Error(
          `Latest minecraft version has not found, make sure the version manifest is loaded [not initialized version manifest storage]`
        );
      }

      // Default profile
      this.profileList = [
        {
          id: uuid.v4(),
          profileName: "Latest",
          versionId: latestMinecraftVersion.id,
        },
      ];

      // Render into disk
      this.saveIntoDisk();
      return;
    }

    console.log(`Load the profile list from ${getProfilePath()}`);

    // Load from profile file
    this.profileList = this.readFromDisk();
  }

  private static saveIntoDisk() {
    fs.writeFileSync(getProfilePath(), JSON.stringify(this.profileList));
  }

  private static readFromDisk() {
    return JSON.parse(fs.readFileSync(getProfilePath(), "utf-8")) as Profile[];
  }

  public static async unload() {
    this.saveIntoDisk();
  }

  public static getProfileList() {
    return this.profileList;
  }

  public static createProfile(profile: Profile) {
    console.log(
      `Create new profile ${profile.profileName} with ${profile.versionId}`
    );

    this.profileList.push(profile);
  }

  public static removeProfile(id: string) {
    console.log(`Remove a profile with id ${id}`);

    this.profileList = this.profileList.filter((profile) => profile.id !== id);
  }
}
