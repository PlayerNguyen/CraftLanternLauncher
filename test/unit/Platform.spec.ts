import { expect } from "chai";
import { isLinux, isMacOs, isWindows } from "../../src/electron/utils/Platform";
import { resetFakePlatform, setFakePlatform } from "./utils/fake-os";

describe("Fake operating system mock test", () => {
  it("should fake to darwinx", () => {
    setFakePlatform("darwinx");
    expect(process.platform).to.eq("darwinx");
    // Reset test
    resetFakePlatform();
  });

  it(`should reset environment`, () => {
    resetFakePlatform();
    expect(process.platform).to.eq(
      isLinux() ? `linux` : isMacOs() ? `darwin` : `win32`
    );
  });
});

describe("MacOS", () => {
  /**
   * Set platform into darwin
   */
  before(() => {
    setFakePlatform("darwin");
  });

  /**
   * Reset a platform
   */
  after(() => {
    resetFakePlatform();
  });

  it("validate the platform", () => {
    expect(isMacOs()).to.be.true;
  });

  it(`negative of others platform`, () => {
    expect(isWindows()).to.be.false;
    expect(isLinux()).to.be.false;
  });
});

describe("Windows", () => {
  /**
   * Set platform into darwin
   */
  before(() => {
    setFakePlatform("win32");
  });

  /**
   * Reset a platform
   */
  after(() => {
    resetFakePlatform();
  });

  it("validate the platform", () => {
    expect(isWindows()).to.be.true;
  });

  it(`negative of others platforms`, () => {
    expect(isLinux()).to.be.false;
    expect(isMacOs()).to.be.false;
  });
});

describe("Linux", () => {
  /**
   * Set platform into darwin
   */
  before(() => {
    setFakePlatform("linux");
  });

  /**
   * Reset a platform
   */
  after(() => {
    resetFakePlatform();
  });

  it("validate the platform", () => {
    expect(isLinux()).to.be.true;
  });

  it(`negative of others platforms`, () => {
    expect(isWindows()).to.be.false;
    expect(isMacOs()).to.be.false;
  });
});
