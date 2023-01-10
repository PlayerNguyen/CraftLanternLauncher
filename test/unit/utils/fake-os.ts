let backup = process.platform;

export function setFakePlatform(value: string | NodeJS.Platform) {
  Object.defineProperty(process, "platform", {
    value,
  });
}

export function resetFakePlatform() {
  Object.defineProperty(process, "platform", {
    value: backup,
  });
}
