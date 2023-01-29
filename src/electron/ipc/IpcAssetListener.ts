import { PathLike } from "fs";
import { HashableDownloadItem } from "./../download/download";
import { AdoptiumResponse } from "./../mojang/GameVersion";
import needle from "needle";
import { MinecraftManifestStorage } from "./../mojang/MinecraftVersionManifest";

import { IpcMainInvokeEvent } from "electron";
import { cpSync, existsSync, mkdirSync, rmSync } from "original-fs";
import {
  getAssetsDirPath,
  getGameLibraryDirectory,
  getRuntimeDirectory,
} from "../AssetResolver";
import { Download } from "../download/download";
import { GameVersion, GameVersionStorage } from "../mojang/GameVersion";

import { IpcMainInvokeListener } from "./IpcMainListener";
import path from "path";
import chalk from "chalk";
import { isLinux, isMacOs, isWindows } from "../utils/Platform";
import { extractTarGzip, extractZip } from "../archive";
import { createJavaRuntimeProfile } from "../jre/JavaRuntimeBuilder";
import {
  getGameAssetChildDirectoryFromHash,
  getGameAssetUrlFromHash,
} from "../mojang/GameAssetIndex";

export class SendAssetDownloadListener implements IpcMainInvokeListener {
  name = "asset:download";
  type = "send";
  listen = async (_event: IpcMainInvokeEvent, ...args: any[]) => {
    let targetDownloadVersion = args[0];

    // Get asset version or make it if it is not existed
    if (!existsSync(getAssetsDirPath())) {
      mkdirSync(getAssetsDirPath());
    }

    // Has game version or not
    const _version = MinecraftManifestStorage.getVersionFromId(
      targetDownloadVersion
    );
    if (!_version) {
      throw new Error(`Game version target must be true`);
    }

    let gameVersion: GameVersion = await GameVersionStorage.get(
      targetDownloadVersion
    );
    console.log(
      `Compare with current runtime major version: result ${gameVersion.isCurrentRuntimeMatch()}...`
    );
    // Game runtime check and download
    let _download = new Download();

    _download.on("data", (buffer, _item, progress) => {
      console.info(
        `${chalk.gray(`$`)} ${path.basename(
          _item.path.toString()
        )} with progress | ${(
          progress.getProgressSize() /
          1024 /
          1024
        ).toPrecision(3)} Mb / ${(
          progress.getActualSize() /
          1024 /
          1024
        ).toPrecision(3)} Mb |  ${(
          (progress.getProgressSize() / progress.getActualSize()) *
          100
        ).toFixed(2)} % `
      );
    });
    if (!gameVersion.isCurrentRuntimeMatch()) {
      // Fetch the metadata of the runtime, then download it later
      let runtimeMetadataUrl = gameVersion.getRuntimeAssetMetadataUrl();
      console.log(`Fetching runtime from metadata ${runtimeMetadataUrl}...`);

      let runtimeMetadata: AdoptiumResponse = (
        await needle("get", runtimeMetadataUrl)
      ).body[0];

      Promise.resolve()
        .then(() => handleDownloadRuntime(runtimeMetadata, _download))
        .then(async (_path: PathLike) => {
          // let downloadedRuntime: DownloadedEvent = items[0];

          const tempDirectory = path.resolve(getRuntimeDirectory(), `tmp`);
          const dataDirectory = path.resolve(getRuntimeDirectory(), "data");
          const downloadDirectory = path.resolve(
            getRuntimeDirectory(),
            "downloads"
          );
          if (!existsSync(tempDirectory)) mkdirSync(tempDirectory);
          if (isMacOs() || isLinux()) {
            // Extract the gz, then extract the tar using terminal
            await extractTarGzip(_path, tempDirectory);
          } else if (isWindows()) {
            await extractZip(_path, tempDirectory);
          }

          // Copy to a data
          console.log(`Clone runtime data into 'data' directory`);

          cpSync(
            path.resolve(tempDirectory, runtimeMetadata.release_name),
            dataDirectory,
            { recursive: true }
          );

          // Then remove tmp directory
          console.log(`Cleaning 'tmp' directory`);
          if (existsSync(tempDirectory))
            rmSync(tempDirectory, { force: true, recursive: true });
          if (existsSync(downloadDirectory))
            rmSync(downloadDirectory, { force: true, recursive: true });
          return dataDirectory;
        })
        .then((dataDirectory: string) => {
          // Create runtime profile
          createJavaRuntimeProfile({
            major: runtimeMetadata.version.major,
            path: dataDirectory,
            version: runtimeMetadata.version.semver,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // Game asset increase download
    handleDownloadLibraries(gameVersion, _download)
      .then(() => {
        console.log(
          `Successfully updated all requested library for version ${
            gameVersion.getGameVersionResponse().id
          }`
        );
      })
      .then(() => {
        handleDownloadAssets(gameVersion, _download);
      })
      .then(() => {
        console.log(
          `Successfully download game asset for ${gameVersion.getId()}`
        );
      })
      .catch(console.error);
  };
}

function handleDownloadRuntime(
  runtimeMetadata: AdoptiumResponse,
  download: Download
) {
  return new Promise<PathLike>((resolve, reject) => {
    // If the download path is not exist
    let { checksum, size, name, link } = runtimeMetadata.binary.package;
    let downloadPath = path.resolve(getRuntimeDirectory(), "downloads", name);

    if (existsSync(downloadPath)) {
      return resolve(downloadPath);
    }

    const runtimeDownloadItem: HashableDownloadItem = {
      path: downloadPath,
      url: link,
      size,
      hash: {
        algorithm: "sha256",
        value: checksum,
      },
    };

    console.log(runtimeDownloadItem);
    download.addItem(runtimeDownloadItem);

    download.start({ mkdirIfNotExists: true });
    download.on("error", (error) => {
      reject(error);
    });

    download.on("done", async () => {
      resolve(downloadPath);
    });
  });
}

function handleDownloadLibraries(gameVersion: GameVersion, download: Download) {
  return new Promise<void>((res, rej) => {
    let requestedLibraries = gameVersion.getRequestedLibrary();
    // Eliminate the existed file
    let willDownloadLibraries = requestedLibraries.filter(
      (library) =>
        library.downloads &&
        !existsSync(
          path.resolve(
            getGameLibraryDirectory(),
            library.downloads?.artifact.path.toString()
          )
        )
    );
    // Not found downloads.artifacts
    for (let willDownloadItem of willDownloadLibraries) {
      if (!willDownloadItem.downloads) {
        return rej(
          new Error(
            `Unexpected value ${willDownloadItem}, not found downloads.artifact`
          )
        );
      }

      const {
        path: _path,
        sha1,
        size,
        url,
      } = willDownloadItem.downloads?.artifact;
      const downloadItem = {
        path: path.resolve(getGameLibraryDirectory(), _path),
        size,
        url,
        hash: {
          algorithm: `sha1`,
          value: sha1,
        },
      };

      download.addItem(downloadItem);
      console.log(downloadItem);
    }
    download.on("error", (err) => {
      rej(err);
    });
    download.on("done", () => {
      res();
    });

    if (!download.isEmpty()) {
      download.start({ mkdirIfNotExists: true });
    } else {
      res();
    }
  });
}

async function handleDownloadAssets(
  gameVersion: GameVersion,
  download: Download
) {
  const gameAssetIndexResponse = await needle(
    "get",
    gameVersion.getGameAssetsIndexObject().url
  );
  return new Promise<void>((resolve, reject) => {
    // const gameAssetMap = new Map<string, { hash: string; size: number }>();
    // Deserialize the game asset since it is using map-object type
    Object.keys(gameAssetIndexResponse.body.objects).forEach((str) => {
      // gameAssetMap.set(str, gameAssetIndexResponse.body.objects[str]);
      // Put to download queue if the file is not exist
      const { hash, size } = gameAssetIndexResponse.body.objects[str];
      const filePath = path.resolve(
        getAssetsDirPath(),
        "objects",
        getGameAssetChildDirectoryFromHash(hash)
      );
      if (!existsSync(filePath)) {
        const downloadItem = {
          path: filePath,
          size,
          url: getGameAssetUrlFromHash(hash),
          hash: {
            algorithm: `sha1`,
            value: hash,
          },
        };
        console.log(downloadItem);
        download.addItem(downloadItem);
      }
    });
    if (!download.isEmpty()) download.start({ mkdirIfNotExists: true });
    download.on("done", () => {
      resolve();
    });
    download.on("error", (error) => {
      reject(error);
    });
    // console.log(gameAssetMap);
  });
}
