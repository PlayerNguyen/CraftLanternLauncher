import fs from "fs";
import { PathLike } from "fs";
import needle from "needle";
import {
  getRuntimeDirectory,
  getRuntimeProfileFileName,
} from "../AssetResolver";

export interface AdoptiumAvailableRuntimeResponse {
  available_lts_releases: [number];
  available_releases: [number];

  most_recent_feature_release: number;
  most_recent_feature_version: number;
  most_recent_lts: number;
  tip_version: number;
}

export async function getAdoptiumAvailableRuntimeItems(): Promise<AdoptiumAvailableRuntimeResponse> {
  let _response = (
    await needle("get", `https://api.adoptium.net/v3/info/available_releases`, {
      json: true,
    })
  ).body;

  return _response;
}

/**
 * Get the runtime existence.
 *
 * @returns true if the runtime was installed before, false otherwise
 */
export function hasInstalledJavaRuntime() {
  return (
    fs.existsSync(getRuntimeDirectory()) &&
    fs.existsSync(getRuntimeProfileFileName())
  );
}
export interface JavaRuntimeProfile {
  version: string;
  major: number;
  path: PathLike;
}

export interface JavaRuntimeCreateOptions {
  overwrite?: boolean;
}

export function createJavaRuntimeProfile(
  profile: JavaRuntimeProfile,
  options?: JavaRuntimeCreateOptions
) {
  if (
    fs.existsSync(getRuntimeProfileFileName()) &&
    (!options || !options.overwrite)
  ) {
    throw new Error(
      `Cannot overwrite runtime profile file, using option { overwrite: true }.`
    );
  }
  if (!fs.existsSync(getRuntimeDirectory()))
    fs.mkdirSync(getRuntimeDirectory());
  // Write the file into disk
  fs.writeFileSync(getRuntimeProfileFileName(), JSON.stringify(profile));
}

export function getJavaRuntimeProfile(): JavaRuntimeProfile | undefined {
  if (!fs.existsSync(getRuntimeProfileFileName())) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(getRuntimeProfileFileName(), "utf-8"));
}

export function getMajorFromProfile(): number | undefined {
  let currentProfile = getJavaRuntimeProfile();
  if (!currentProfile) {
    return undefined;
  }
  return currentProfile.major;
}
