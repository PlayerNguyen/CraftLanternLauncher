import chalk from "chalk";
import { ProfileStorage } from "./electron/profile/Profile";
import { app, BrowserWindow, ipcMain } from "electron";
import {
  getApplicationDataPath,
  getAppPath,
  getConfigPath,
  setupDirectory,
} from "./electron/AssetResolver";
import path from "path";
import { ConfigurationStatic } from "./electron/configurations/Configuration";
import { MinecraftManifestStorage } from "./electron/mojang/MinecraftVersionManifest";
import { IpcMainListenerRegistry } from "./electron/ipc/IpcMainListenerRegistry";

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
