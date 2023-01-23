import {
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "original-fs";
import { isLinux, isMacOs, isWindows } from "../utils/Platform";
import os from "os";
import { arch } from "../utils/Arch";
import { MinecraftManifestStorage } from "./MinecraftVersionManifest";
import { getVersionsDirectory } from "../AssetResolver";
import path from "path";
import { fetchAsStream } from "../download/fetch";
import needle from "needle";
export type GameVersionAction = "allow" | "deny";

export interface GameVersionGameArguments {
  rules: [
    {
      action: GameVersionAction;
      features: { has_custom_resolution: boolean } | { is_demo_user: boolean };
    }
  ];
  value: string | [string];
}

export interface GameBundleInfo {
  sha1: string;
  size: number;
  url: string;
}

export interface GameVersionJvmArguments {
  rules: [
    {
      action: GameVersionAction;
      os: GameVersionOperatingSystem;
    }
  ];
  value: string | [string];
}

export interface GameVersionLibrary {
  downloads?: GameVersionLibraryDownloads;
  name?: string;
  rules?: GameVersionLibraryRule[];
}

export interface GameVersionLibraryDownloads {
  artifact: GameVersionLibraryArtifact;
}

export interface GameVersionLibraryArtifact {
  path: string;
  sha1: string;
  size: number;
  url: string;
}

export interface GameVersionLibraryRule {
  action: string | "allow" | "deny";
  os: GameVersionOperatingSystem;
}

export interface GameVersionOperatingSystem {
  name?: "osx" | "linux" | "windows";
  version?: RegExp;
  arch?: string;
}

export interface GameVersionResponse {
  arguments: {
    game: [string | GameVersionGameArguments];
    jvm: [string | GameVersionJvmArguments];
  };

  assetIndex: {
    id: string;
    sha1: string;
    size: number;
    totalSize: number;
    url: string;
  };

  assets: string | number;
  complianceLevel: string;

  downloads: {
    client: GameBundleInfo;
    client_mappings: GameBundleInfo;
    server: GameBundleInfo;
    server_mappings: GameBundleInfo;
  };

  id: string;
  javaVersion: {
    component: string;
    majorVersion: number;
  };

  libraries: GameVersionLibrary[];
  logging: {
    client: {
      argument: string;
      file: {
        id: string;
        sha1: string;
        size: number;
        url: string;
      };
      type: string | "log4j2-xml";
    };
  };

  mainClass: string;
  minimumLauncherVersion: number;
  releaseTime: Date;
  time: Date;
  type: "release" | "snapshot" | "old_alpha";
}

export class GameVersionParser {
  public parse(gameVersion: string): GameVersionResponse {
    return JSON.parse(gameVersion);
  }
}

export class GameVersion {
  private response: GameVersionResponse;

  constructor(response: GameVersionResponse) {
    this.response = response;
  }

  public getMajorRuntimeUrl(): string {
    let major = this.response.javaVersion.majorVersion;
    let systemArch = arch();
    let imageType = "jdk";
    let jvmImplementation = "hotspot";
    let os = isMacOs() ? "mac" : isLinux() ? "linux" : "windows";
    let releaseType = "ga";
    let heapSize = "normal";
    let vendor = "eclipse";
    const adoptiumUrl = `https://api.adoptium.net/v3`;
    return `${adoptiumUrl}/binary/latest/${major}/${releaseType}/${os}/${systemArch}/${imageType}/${jvmImplementation}/${heapSize}/${vendor}?project=jdk`;
  }

  public isCurrentRuntimeMatch(): boolean {
    // TODO: compare the current runtime and returns using version sematic
    // TODO: if version is not set, return false value
    throw new Error("Unimplemented ");
  }

  /**
   * Get Minecraft required libraries for matching platform.
   *
   * @returns all required libraries for matching platform.
   */
  public getRequestedLibrary(): GameVersionLibrary[] {
    const arr = [];
    for (let i = 0; i < this.response.libraries.length; i++) {
      const library = this.response.libraries[i];

      // Non-conditional case
      if (!library.rules) {
        arr.push(library);
        continue;
      }

      // Accept all rules, mean the library is allow to use
      if (
        library.rules.every((rule) => GameVersionLibraryRuleFilter.accept(rule))
      ) {
        arr.push(library);
      }
    }

    return arr;
  }

  public buildCompatibleParameters(): string[] {
    //TODO: do something with this please
    return [];
  }
}

/**
 * The library rules are only contains operation system information
 * to classify the library. Since need to filter the
 * operating system and its' action.
 */
export class GameVersionLibraryRuleFilter {
  public static accept(rule: GameVersionLibraryRule): boolean {
    // Determine operating system that affect on the rule
    let isAcceptRuleOperatingSystem: boolean = false;
    if (rule.os) {
      // Accept the platform name first
      let isExactPlatform = !rule.os.name
        ? true
        : (rule.os.name === "osx" && isMacOs()) ||
          (rule.os.name === "linux" && isLinux()) ||
          (rule.os.name === "windows" && isWindows());

      // Validate operating system version
      let isVersionMatch = !rule.os.version
        ? true
        : testWithRegExp(rule.os.version, os.platform());

      // Validate architecture
      let isValidateArch = !rule.os.arch
        ? true
        : (rule.os.arch === "x86" && arch() === "x86") ||
          (rule.os.arch === "x64" && arch() === "x64");

      // F(a, b, c) = a.b.c: due to my Boolean Algebra class :)
      isAcceptRuleOperatingSystem =
        isExactPlatform && isVersionMatch && isValidateArch;
    }

    return isAcceptRuleOperatingSystem && rule.action === "allow";
  }
}

/**
 * Test a string by using RegExp pattern. Using RegExp.test to test with.
 *
 * @param regexpPattern a RegExp pattern , can take string or JavaScript RegExp value
 * @param string a string to test against
 * @returns true if the string is match to pattern, false otherwise
 */
export function testWithRegExp(
  regexpPattern: string | RegExp,
  string: string
): boolean {
  const _reg = new RegExp(regexpPattern);
  return _reg.test(string);
}

export class GameVersionStorage {
  private static gameVersionLoaded: Map<string, GameVersion> = new Map();

  /**
   * Get the game version which is downloaded in asset directory, or fetch from
   * manifest storage.
   *
   * @param versionId the game version id
   */
  public static get(versionId: string): Promise<GameVersion> {
    return new Promise<GameVersion>((resolve, reject) => {
      // Get from memory
      let fromMap = this.gameVersionLoaded.get(versionId);
      if (fromMap) {
        return resolve(fromMap);
      }

      // Get from file
      let versionFileName = path.resolve(
        getVersionsDirectory(),
        `${versionId}.json`
      );
      if (existsSync(getVersionsDirectory()) && existsSync(versionFileName)) {
        let parsedGameVersion = JSON.parse(
          readFileSync(versionFileName, "utf-8")
        );
        this.gameVersionLoaded.set(versionId, parsedGameVersion);
        return resolve(parsedGameVersion);
      }

      // Get from minecraft api and version manifest
      if (!existsSync(getVersionsDirectory())) {
        mkdirSync(getVersionsDirectory());
      }
      let _version = MinecraftManifestStorage.getVersionFromId(versionId);
      if (!_version) {
        throw new Error(`Cannot determine version ${versionId}`);
      }

      needle("get", _version.url.toString(), { parse: true })
        .then((response) => {
          let body = response.body;
          this.gameVersionLoaded.set(versionId, response.body);
          writeFileSync(versionFileName, JSON.stringify(body));
          resolve(body);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Remove the game version which loaded
   * @param versionId the version id to remove
   */
  public static remove(versionId: string) {
    return this.gameVersionLoaded.delete(versionId);
  }
}
