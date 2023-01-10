/**
 * Check if the current system is running on `darwin`.
 * @returns true if the current machine is running on `darwin` platform system
 */
export function isMacOs() {
  return process.platform === "darwin";
}

/**
 * Check if the current system is running on `win32`.
 * @returns true if the current machine is running on `win32` system
 */
export function isWindows() {
  return process.platform === "win32";
}

/**
 * Check if the current system is running on `linux`.
 * @returns true if the current machine is running on `linux` system
 */
export function isLinux() {
  return process.platform === "linux";
}
