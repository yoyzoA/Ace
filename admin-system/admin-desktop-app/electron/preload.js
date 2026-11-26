const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('adminShell', {
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openSettings: () => ipcRenderer.invoke('settings:open')
});

// Used by the settings window (setup.html).
contextBridge.exposeInMainWorld('adminSetup', {
  load: () => ipcRenderer.invoke('setup:load'),
  importEnvFile: () => ipcRenderer.invoke('setup:import'),
  save: (values) => ipcRenderer.invoke('setup:save', values)
});
