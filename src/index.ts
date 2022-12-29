import { app, BrowserWindow, dialog, ipcMain } from "electron";
import {
  getApplicationDataPath,
  getAppPath,
  setupDirectory,
} from "./electron/AssetResolver";
import path from "path";
import { isDevelopment } from "./electron/Application";
import { ConfigurationStatic } from "./electron/configurations/Configuration";
import {
  fetchMinecraftVersionManifest,
  MinecraftManifestStorage,
} from "./electron/mojang/MinecraftVersionManifest";

let window: BrowserWindow | null = null;

async function init() {
  // Setup the launcher directory
  setupDirectory();

  // Setup the memory configuration
  ConfigurationStatic.getMemoryConfiguration();

  // Load version manifest
  await MinecraftManifestStorage.getManifest();
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
  console.log(`Using ${getApplicationDataPath()} as appData `);

  await init();

  // Inspect window
  createWindow();

  // Load ipc
  ipcMain.handle("config:get", async (event, ...args) => {
    if (!ConfigurationStatic.getMemoryConfiguration().has(args[0])) {
      throw new Error(`Config not found ${args}`);
    }

    return ConfigurationStatic.getMemoryConfiguration().get(args[0]);
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
