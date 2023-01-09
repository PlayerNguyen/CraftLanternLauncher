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

contextBridge.exposeInMainWorld("profile", {
  getProfileList: () => ipcRenderer.invoke("profile:get"),
  addProfile: (name: string, version: string) =>
    ipcRenderer.invoke("profile:add", { name, version }),
});

contextBridge.exposeInMainWorld("launcher", {
  handleInit: (callback: any) => ipcRenderer.on("launcher:init", callback),
  clearInitChannels: () => ipcRenderer.removeAllListeners("launcher:init"),
  handleBoot: (callback: any) => ipcRenderer.on("launcher:boot", callback),
  clearBootChannel: () => ipcRenderer.removeAllListeners("launcher:boot"),
  handleError: (callback: any) => ipcRenderer.on("launcher:error", callback),
  clearErrorChannels: () => ipcRenderer.removeAllListeners("launcher:error"),
});
