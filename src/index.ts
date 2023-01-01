import { ProfileStorage } from "./electron/profile/Profile";
import { app, BrowserWindow, ipcMain } from "electron";
import {
  getApplicationDataPath,
  getAppPath,
  getAssetsDirPath,
  getConfigPath,
  setupDirectory,
} from "./electron/AssetResolver";
import path from "path";
import { ConfigurationStatic } from "./electron/configurations/Configuration";
import { MinecraftManifestStorage } from "./electron/mojang/MinecraftVersionManifest";
import { IpcMainListenerRegistry } from "./electron/ipc/IpcMainListenerRegistry";
import { DownloaderService } from "./electron/download/DownloaderService";

let window: BrowserWindow | null = null;

/**
 * Load the application before render the renderer
 * Note: the browser window (renderer) are not loaded.
 */
async function loadApplication() {
  // Setup the launcher directory
  console.log(`Using ${getApplicationDataPath()} as appData `);
  setupDirectory();

  // Setup the memory configuration
  console.log(`Loading configuration from ${getConfigPath()} if existed`);
  ConfigurationStatic.getMemoryConfiguration();

  // Load version manifest
  console.log(`Updating version manifest if possible`);
  await MinecraftManifestStorage.getManifest();

  // Load the profile
  console.log(`Loading list of profiles`);

  await ProfileStorage.load();
}

async function unloadApplication() {
  // Unload profile
  await ProfileStorage.unload();
}

function createWindow() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(
        getAppPath(),
        app.isPackaged ? "./dist/render/index.html" : "./preload.js"
      ),
    },
  });

  window.loadFile(
    path.join(
      getAppPath(),
      app.isPackaged ? "./dist/render/index.html" : "./../render/index.html"
    )
  );
}

app.whenReady().then(async () => {
  /**
   * Before load, setup app data directory
   */
  await loadApplication();

  // Inspect window
  createWindow();

  // Load IPC
  let registry = new IpcMainListenerRegistry();
  // TODO: Register the listener for api
  registry.subscribe();

  // Downloader
  // let gameAssetDownloader = new DownloaderService(window);
  // for (let i = 0; i < 10; i++) {
  //   gameAssetDownloader.addItem({
  //     path: path.join(getAssetsDirPath(), `ico_${i}.png`),
  //     url: "https://avatars.githubusercontent.com/u/10703461?s=40&v=4",
  //     size: 1291,
  //   });
  // }

  // gameAssetDownloader.on("finish-once", (item) => {
  //   console.log(item);
  // });

  //  let gameAssetDownloader = new GameAssetDownloader(window);
  //   gameAssetDownloader.addItem(
  //     {
  //       path: "./test/adoptiumjdk1.tar.gz",
  //       url: "https://objects.githubusercontent.com/github-production-release-asset-2e65be/372924883/79931b4b-4af9-48a9-b595-0e5988b8ca98?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20221231%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221231T051807Z&X-Amz-Expires=300&X-Amz-Signature=28e3005cb46aef02de70a4150d92af173827683e306a5aedb8359f828ffc8be8&X-Amz-SignedHeaders=host&actor_id=10703461&key_id=0&repo_id=372924883&response-content-disposition=attachment%3B%20filename%3DOpenJDK11U-jdk_x64_linux_hotspot_11.0.17_8.tar.gz&response-content-type=application%2Foctet-stream",
  //     },
  //     {
  //       path: "./test/adoptiumjdk2.tar.gz",
  //       url: "https://objects.githubusercontent.com/github-production-release-asset-2e65be/372924883/79931b4b-4af9-48a9-b595-0e5988b8ca98?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20221231%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221231T051807Z&X-Amz-Expires=300&X-Amz-Signature=28e3005cb46aef02de70a4150d92af173827683e306a5aedb8359f828ffc8be8&X-Amz-SignedHeaders=host&actor_id=10703461&key_id=0&repo_id=372924883&response-content-disposition=attachment%3B%20filename%3DOpenJDK11U-jdk_x64_linux_hotspot_11.0.17_8.tar.gz&response-content-type=application%2Foctet-stream",
  //     },
  //     {
  //       path: "./test/adoptiumjdk3.tar.gz",
  //       url: "https://objects.githubusercontent.com/github-production-release-asset-2e65be/372924883/79931b4b-4af9-48a9-b595-0e5988b8ca98?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20221231%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221231T051807Z&X-Amz-Expires=300&X-Amz-Signature=28e3005cb46aef02de70a4150d92af173827683e306a5aedb8359f828ffc8be8&X-Amz-SignedHeaders=host&actor_id=10703461&key_id=0&repo_id=372924883&response-content-disposition=attachment%3B%20filename%3DOpenJDK11U-jdk_x64_linux_hotspot_11.0.17_8.tar.gz&response-content-type=application%2Foctet-stream",
  //     }
  //   );

  // gameAssetDownloader.downloadItems();
  

  // gameAssetDownloader.on("completed", (_i) => {
  //   console.log(_i.length);
  //   console.log(_i);
  // });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", async () => {
  console.log(`Unload everything...`);
  await unloadApplication();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
