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

async function beforeLoadWindow() {
  // Setup the launcher directory
  console.log(`Using ${getApplicationDataPath()} as appData `);
  setupDirectory();
}
function loadWindow() {
  // Inspect window
  let _window = createWindow();
  // Init the launcher (loading state)
  _window.on("ready-to-show", async () => {
    await afterLoadWindow(_window);
  });
  // Set traffic light
  _window.setWindowButtonVisibility(false);
  return _window;
}
async function afterLoadWindow(window: BrowserWindow) {
  try {
    // Setup the memory configuration
    console.log(`Loading configuration from ${getConfigPath()} if existed`);
    window.webContents.send("launcher:boot", "config");
    ConfigurationStatic.getMemoryConfiguration();

    // Load version manifest
    console.log(`Updating version manifest if possible`);
    window.webContents.send("launcher:boot", "version_manifest");
    await MinecraftManifestStorage.getManifest();

    // Load the profile
    console.log(`Loading list of profiles`);
    window.webContents.send("launcher:boot", "profile");
    await ProfileStorage.load();

    // window.webContents.send("launcher:init");
    // window.setWindowButtonVisibility(true)
  } catch (err) {
    window.webContents.send("launcher:error", err)
    throw err;
  }
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
    titleBarStyle: "hiddenInset",
  });

  window.loadFile(
    path.join(
      getAppPath(),
      app.isPackaged ? "./dist/render/index.html" : "./../render/index.html"
    )
  );

  return window;
}

app.whenReady().then(async () => {
  /**
   * Before load, setup app data directory
   */
  await beforeLoadWindow();
  window = loadWindow();
  // await afterLoadWindow(window);

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
