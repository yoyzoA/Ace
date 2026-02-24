const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('adminShell', {
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
});
