export function isSkippedDownload(): boolean {
  return process.env.TEST_SKIP_DOWNLOAD === "true";
}
