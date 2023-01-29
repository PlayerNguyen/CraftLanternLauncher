import path from "path";
export function getGameAssetUrlFromHash(hash: string) {
  return `https://resources.download.minecraft.net/${hash.substring(
    0,
    2
  )}/${hash}`;
}

export function getGameAssetChildDirectoryFromHash(hash: string) {
  const firstTwoLetter = hash.substring(0, 2);

  // return path.resolve(firstTwoLetter, hash);
  return `${firstTwoLetter}${path.sep}${hash}`;
}
