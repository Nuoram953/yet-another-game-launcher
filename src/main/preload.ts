// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
//
//
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  runCommand: (command:any) => ipcRenderer.invoke('run-command', command),
  updateLibraries: (forceReload:boolean) => ipcRenderer.invoke('update-libraries', forceReload),
  getStoredPicturesDirectory: () => ipcRenderer.invoke('get-pictures-directory'),
  getSteamGames: () => ipcRenderer.invoke('get-steam-games'),
})
