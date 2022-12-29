import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld("environments", {
  isDevelopment: process.env.NODE_ENV === "development",
});

contextBridge.exposeInMainWorld("config", {
  get: (key: string) => ipcRenderer.invoke("config:get", key),
});
