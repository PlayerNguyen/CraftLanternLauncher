import { rimraf } from "rimraf";
import path from "path";
import {
  GameVersionLibraryRule,
  GameVersionLibraryRuleFilter,
  GameVersionStorage,
} from "./../../src/electron/mojang/GameVersion";
import {
  GameVersion,
  testWithRegExp,
} from "./../../src/electron/mojang/GameVersion";
import { GameVersionResponse } from "./../../src/electron/mojang/GameVersion";
import { expect } from "chai";
import needle from "needle";
import { MinecraftManifestStorage } from "../../src/electron/mojang/MinecraftVersionManifest";
import { resetFakePlatform, setFakePlatform } from "./utils/fake-os";
import { resetFakeArch, setFakeArch } from "../../src/electron/utils/Arch";
import { existsSync } from "fs";
import {
  getAssetsDirPath,
  getVersionsDirectory,
} from "../../src/electron/AssetResolver";

describe("GameVersion", () => {
  let gameVersionResponse: GameVersionResponse;
  /**
   * Load latest version manifest, then
   * load the latest game version file to test
   */
  before(async () => {
    let latestVersion =
      await MinecraftManifestStorage.getLatestReleaseVersion();
    if (!latestVersion) {
      throw new Error("The latest version is undefined");
    }
    // gameVersionResponse = String(
    //   await (
    //     await needle("get", latestVersion.url.toString())
    //   ).body
    // );

    gameVersionResponse = await (
      await needle("get", latestVersion.url.toString(), { json: false })
    ).body;
  });

  afterEach(() => resetFakePlatform());

  it("Response the valid game version", () => {
    expect(gameVersionResponse).to.not.be.undefined;
    expect(gameVersionResponse).all.keys([
      `arguments`,
      `assetIndex`,
      `assets`,
      `complianceLevel`,
      `downloads`,
      `id`,
      `javaVersion`,
      `libraries`,
      `logging`,
      `mainClass`,
      `minimumLauncherVersion`,
      `releaseTime`,
      `time`,
      `type`,
    ]);
  });

  let gameVersionObject: GameVersion;
  before(() => {
    gameVersionObject = new GameVersion(gameVersionResponse);
  });

  it(`Return all library request for macos`, () => {
    setFakePlatform("darwin");
    let gameLibForOsX = gameVersionObject.getRequestedLibrary();
    expect(gameLibForOsX.length).to.gt(0);
    expect(
      gameLibForOsX.some(
        (library) =>
          library.rules && library.rules.some((rule) => rule.os.name === "osx")
      )
    ).to.be.true;

    // Some lib name contains `{abc}-macos`, test for it
    expect(gameLibForOsX.some((lib) => lib.name?.includes("macos"))).to.be.true;
  });

  it(`Return all library request for linux`, () => {
    setFakePlatform("linux");
    let gameLibForLinux = gameVersionObject.getRequestedLibrary();
    expect(gameLibForLinux.length).to.gt(0);
    expect(
      gameLibForLinux.some(
        (library) =>
          library.rules &&
          library.rules.some((rule) => rule.os.name === "linux")
      )
    ).to.be.true;

    // Some lib name contains `{abc}-linux`, test for it
    expect(gameLibForLinux.some((lib) => lib.name?.includes("linux"))).to.be
      .true;
  });

  it(`Return all library request for windows`, () => {
    setFakePlatform("win32");
    let gameLibForWindows = gameVersionObject.getRequestedLibrary();
    expect(gameLibForWindows.length).to.gt(0);
    expect(
      gameLibForWindows.some(
        (library) =>
          library.rules &&
          library.rules.some((rule) => rule.os.name === "windows")
      )
    ).to.be.true;

    // Some lib name contains `{abc}-windows`, test for it
    expect(gameLibForWindows.some((lib) => lib.name?.includes("windows"))).to.be
      .true;

    // Non-rule library test: must contains some non-rule libs
    expect(gameLibForWindows.some((lib) => !lib.rules)).to.be.true;
  });

  describe(`Returns runtime url for compatible operating system`, () => {
    afterEach(() => {
      resetFakePlatform();
      resetFakeArch();
    });

    it(`MacOS`, () => {
      setFakePlatform("darwin");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("mac");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("x64");
    });

    it(`Windows ~ 32bit arch`, () => {
      setFakePlatform("windows");
      setFakeArch("x32");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("windows");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("x32");
    });

    it(`Windows ~ 64bit arch`, () => {
      setFakePlatform("windows");
      setFakeArch("x64");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("windows");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("x64");
      console.log(gameVersionObject.getMajorRuntimeUrl());
    });

    it(`Linux ~ 32bit arch`, () => {
      setFakePlatform("linux");
      setFakeArch("x32");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("linux");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("x32");
    });
    it(`Linux ~ 64bit arch`, () => {
      setFakePlatform("linux");
      setFakeArch("x64");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("linux");
      expect(gameVersionObject.getMajorRuntimeUrl()).includes("x64");
    });
  });
});

describe("RegExp testing function", () => {
  it(`Test against a "^10\\." version`, () => {
    const pattern = "^10\\.";
    expect(testWithRegExp(pattern, "10.2.42")).to.be.true;
    expect(testWithRegExp(pattern, "1.2.42")).to.be.false;
    expect(testWithRegExp(pattern, "10.999")).to.be.true;

    expect(testWithRegExp(pattern, ".2.42")).to.be.false;
  });
});

describe("Library filter", () => {
  /**
   * Make a library object for test.
   *
   * @param action an action between allow or deny state
   * @param osName operating system name
   * @returns a library object from parameter
   */
  const makeLibraryWithName: (
    action: "allow" | "deny",
    osName: "osx" | "linux" | "windows"
  ) => GameVersionLibraryRule = (
    action: "allow" | "deny",
    osName: "osx" | "linux" | "windows"
  ) => {
    return {
      action: action,
      os: {
        name: osName,
      },
    };
  };

  it("Test the library rule filter with  macos (darwin)", () => {
    setFakePlatform("darwin");
    let gameLibraryRule: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "osx"
    );

    expect(GameVersionLibraryRuleFilter.accept(gameLibraryRule)).to.be.true;

    let negative: GameVersionLibraryRule = makeLibraryWithName("deny", "osx");
    expect(GameVersionLibraryRuleFilter.accept(negative)).to.be.false;

    // Different operating systems lead to false
    let windowsLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "windows"
    );
    expect(GameVersionLibraryRuleFilter.accept(windowsLibrary)).to.be.false;

    let linuxLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "linux"
    );
    expect(GameVersionLibraryRuleFilter.accept(linuxLibrary)).to.be.false;
    resetFakePlatform();
  });

  it("Test the library rule filter with windows", () => {
    setFakePlatform("win32"); // Using `win32` instead of `windows` since NodeJS.Platform told me that
    let gameLibraryRule: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "windows"
    );

    expect(GameVersionLibraryRuleFilter.accept(gameLibraryRule)).to.be.true;

    let negative: GameVersionLibraryRule = makeLibraryWithName(
      "deny",
      "windows"
    );
    expect(GameVersionLibraryRuleFilter.accept(negative)).to.be.false;

    // Different operating systems lead to false
    let osXLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "osx"
    );
    expect(GameVersionLibraryRuleFilter.accept(osXLibrary)).to.be.false;

    let linuxLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "linux"
    );
    expect(GameVersionLibraryRuleFilter.accept(linuxLibrary)).to.be.false;
    resetFakePlatform();
  });

  it("Test the library rule filter with linux", () => {
    setFakePlatform("linux");
    let gameLibraryRule: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "linux"
    );

    expect(GameVersionLibraryRuleFilter.accept(gameLibraryRule)).to.be.true;

    let negative: GameVersionLibraryRule = makeLibraryWithName(
      "deny",
      "windows"
    );
    expect(GameVersionLibraryRuleFilter.accept(negative)).to.be.false;

    // Different operating systems lead to false
    let osXLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "osx"
    );
    expect(GameVersionLibraryRuleFilter.accept(osXLibrary)).to.be.false;

    let windowsLibrary: GameVersionLibraryRule = makeLibraryWithName(
      "allow",
      "windows"
    );
    expect(GameVersionLibraryRuleFilter.accept(windowsLibrary)).to.be.false;
    resetFakePlatform();
  });
});

describe("GameVersionStorage", () => {
  before(() => {
    rimraf.sync(getVersionsDirectory());
  });

  it("should get from nothing (force download)", (done) => {
    GameVersionStorage.get("1.12")
      .then((version) => {
        expect(version).not.to.be.undefined;
        expect(existsSync(getVersionsDirectory()), "Exist the main directory")
          .to.be.true;
        expect(
          existsSync(path.resolve(getVersionsDirectory(), "1.12.json")),
          "Exist the json file"
        ).to.be.true;
        done();
      })
      .catch(done);
  });

  it(`should throws when provide unknown minecraft game version`, (done) => {
    GameVersionStorage.get("this is unknown version").catch((err) => {
      expect(err.message).to.include("Cannot determine version");
      done();
    });
  });

  it(`should make a directory before download file`, (done) => {
    GameVersionStorage.get("1.12")
      .then((_gameVersion: GameVersion) => {
        expect(existsSync(getVersionsDirectory())).to.be.true;
        expect(_gameVersion).not.to.be.undefined;
        done();
      })
      .catch(done);
  });

  it(`should get from local machine file`, (done) => {
    GameVersionStorage.remove("1.12");
    GameVersionStorage.get("1.12")
      .then((_gameVersion: GameVersion) => {
        expect(_gameVersion).to.not.be.undefined;

        done();
      })
      .catch(done);
  });
});
