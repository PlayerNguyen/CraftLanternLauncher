import { isLinux, isMacOs, isWindows } from "../utils/Platform";
import os from "os";
import { arch } from "../utils/Arch";
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

  public getCompatibleAdoptiumRuntime() {
    // 

    if (this.response.javaVersion.majorVersion)
    throw new Error("Unimplemented ");
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
