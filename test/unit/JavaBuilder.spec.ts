import { existsSync } from "fs";
import {
  getJavaRuntimeProfile,
  JavaRuntimeProfile,
} from "./../../src/electron/jre/JavaRuntimeBuilder";
import { expect } from "chai";
import {
  getRuntimeDirectory,
  getRuntimeProfileFileName,
} from "../../src/electron/AssetResolver";
import {
  createJavaRuntimeProfile,
  getAdoptiumAvailableRuntimeItems,
  hasInstalledJavaRuntime,
} from "../../src/electron/jre/JavaRuntimeBuilder";
import path from "path";
import fs from "fs";
import { isSkippedDownload } from "./utils/download";
import { rmNonEmptyDir } from "../../src/electron/FileSystem";

after(() => {
  if (existsSync(getRuntimeDirectory())) rmNonEmptyDir(getRuntimeDirectory());
  expect(fs.existsSync(getRuntimeDirectory())).to.be.false;
});

afterEach(() => {
  if (existsSync(getRuntimeProfileFileName()))
    rmNonEmptyDir(getRuntimeProfileFileName());
  expect(fs.existsSync(getRuntimeProfileFileName())).to.be.false;
});

describe("Get JDK version list from Adoptium API", () => {
  if (isSkippedDownload()) {
    before(function () {
      this.skip();
    });
  }
  it("response a version object", async function () {
    this.timeout(10000);
    let runtimeList = await getAdoptiumAvailableRuntimeItems();
    expect(runtimeList).not.to.be.null;
    expect(runtimeList.available_lts_releases).to.be.instanceOf(Array);
    expect(runtimeList.available_releases).to.be.instanceOf(Array);

    expect(typeof runtimeList.most_recent_feature_release).to.eq("number");
    expect(typeof runtimeList.most_recent_feature_version).to.eq("number");

    expect(typeof runtimeList.most_recent_lts).to.eq("number");

    expect(typeof runtimeList.tip_version).to.be.eq("number");
  });
});

describe(`hasInstalledJavaRuntime`, () => {
  it(`should return correct answer `, () => {
    expect(hasInstalledJavaRuntime()).to.be.false;

    // then fake installed runtime
    createJavaRuntimeProfile({
      major: 8,
      version: "8.1.0",
      path: path.resolve(getRuntimeDirectory(), "jdk-major"),
    });

    expect(hasInstalledJavaRuntime()).to.be.true;
  });
});

describe(`createJavaRuntimeProfile`, () => {
  it(`should throws on exist without overwrite`, () => {
    createJavaRuntimeProfile({
      major: 8,
      version: "8.1.0",
      path: path.resolve(getRuntimeDirectory(), "jdk-major"),
    });

    expect(fs.existsSync(getRuntimeProfileFileName())).to.be.true;
    expect(() => {
      createJavaRuntimeProfile({
        major: 8,
        version: "8.1.0",
        path: path.resolve(getRuntimeDirectory(), "jdk-major"),
      });
    }).to.throw(
      `Cannot overwrite runtime profile file, using option { overwrite: true }.`
    );
  });

  it(`should overwrite the runtime profile`, () => {
    createJavaRuntimeProfile({
      major: 8,
      version: "8.1.0",
      path: path.resolve(getRuntimeDirectory(), "jdk-major"),
    });
    expect(fs.existsSync(getRuntimeProfileFileName())).to.be.true;

    expect(() => {
      createJavaRuntimeProfile(
        {
          major: 9,
          version: "9.1.13",
          path: path.resolve(getRuntimeDirectory(), "jdk-major"),
        },
        { overwrite: true }
      );
    }).to.not.throws();

    expect(fs.existsSync(getRuntimeProfileFileName())).to.be.true;
    const runtimeProfile: JavaRuntimeProfile = JSON.parse(
      fs.readFileSync(getRuntimeProfileFileName(), "utf-8")
    );
    expect(runtimeProfile).to.not.undefined;
    expect(runtimeProfile).have.own.property("major");
    expect(runtimeProfile).have.own.property("version");
    expect(runtimeProfile).have.own.property("path");

    expect(runtimeProfile.major).to.be.eq(9);
    expect(runtimeProfile.version).to.be.eq("9.1.13");
    expect(runtimeProfile.path).to.be.eq(
      path.resolve(getRuntimeDirectory(), "jdk-major")
    );
  });
});

describe(`getJavaRuntimeProfile`, () => {
  it(`should get a profile`, () => {
    expect(() => {
      createJavaRuntimeProfile(
        {
          major: 9,
          version: "9.1.13",
          path: path.resolve(getRuntimeDirectory(), "jdk-major"),
        },
        { overwrite: true }
      );
    }).not.throw();

    let javaProfile = getJavaRuntimeProfile();
    expect(javaProfile?.major).to.eq(9);
    expect(javaProfile?.version).to.eq("9.1.13");
    expect(javaProfile?.path).to.eq(
      path.resolve(getRuntimeDirectory(), "jdk-major")
    );
  });

  it(`should return undefined`, () => {
    let javaProfile = getJavaRuntimeProfile();
    expect(javaProfile).to.be.undefined;
  });
});
