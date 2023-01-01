import path from "path";
import fs from "fs";
import { app } from "electron";
import { getApplicationShortName } from "./Application";

function getAppPath() {
  return path.resolve(app.getAppPath());
}

function getApplicationDataPath() {
  return path.resolve(app.getPath("appData"), getApplicationShortName());
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
  return path.resolve(getApplicationDataPath(), "config.json");
}

function getVersionManifestPath() {
  return path.resolve(getApplicationDataPath(), "manifest_v2.json");
}

function getProfilePath() {
  return path.resolve(getApplicationDataPath(), "profiles.json");
}

function getAssetsDirPath() {
  return path.resolve(getApplicationDataPath(), "assets");
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
