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
  if (!fs.existsSync(getApplicationDataPath())) {
    fs.mkdirSync(getApplicationDataPath());
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

export {
  getAppPath,
  getApplicationDataPath,
  setupDirectory,
  getConfigPath,
  getVersionManifestPath,
  getProfilePath,
};
