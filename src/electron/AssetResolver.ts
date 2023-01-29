import path from "path";
import fs from "fs";
import { app } from "electron";
import { getApplicationShortName } from "./Application";

function getAppPath() {
  return process.env.NODE_ENV === "testing"
    ? `./test-output`
    : path.join(app.getAppPath());
}

function getApplicationDataPath() {
  return path.resolve(
    process.env.NODE_ENV === "testing"
      ? `./test-app-data-output`
      : app.getPath("appData"),
    getApplicationShortName()
  );
}

function setupDirectory() {
  const mustMakeDirectory = [getApplicationDataPath(), getAssetsDirPath()];
  for (let directory of mustMakeDirectory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  }
}

function getConfigPath() {
  return path.join(getApplicationDataPath(), "config.json");
}

function getVersionManifestPath() {
  return path.join(getApplicationDataPath(), "manifest_v2.json");
}

function getProfilePath() {
  return path.join(getApplicationDataPath(), "profiles.json");
}

function getAssetsDirPath() {
  return path.join(getApplicationDataPath(), "assets");
}

export function getGameLibraryDirectory() {
  return path.join(getApplicationDataPath(), "libraries");
}

export function getRuntimeDirectory() {
  return path.join(getApplicationDataPath(), "runtime");
}

export function getRuntimeProfileFileName() {
  return path.join(getRuntimeDirectory(), "runtime_profile.json");
}

export function getVersionsDirectory() {
  return path.join(getApplicationDataPath(), "versions");
}

export {
  getAppPath,
  getApplicationDataPath,
  setupDirectory,
  getConfigPath,
  getVersionManifestPath,
  getProfilePath,
  getAssetsDirPath,
};
