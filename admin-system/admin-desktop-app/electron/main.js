const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;
const BACKEND_PORT = '4000';

const resolveBackendPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'admin-backend');
  }
  return path.join(__dirname, '..', '..', 'admin-backend');
};

const startBackend = () => {
  if (backendProcess) {
    return;
  }

  const backendPath = resolveBackendPath();
  const entryPoint = path.join(backendPath, 'server.js');
  const env = {
    ...process.env,
    PORT: BACKEND_PORT,
    ELECTRON_RUN_AS_NODE: '1'
  };

  backendProcess = spawn(process.execPath, [entryPoint], {
    cwd: backendPath,
    env,
    stdio: 'inherit',
    windowsHide: true
  });

  backendProcess.on('exit', (code, signal) => {
    backendProcess = null;
    if (code !== null && code !== 0) {
      console.error(`Admin backend exited with code ${code}.`);
    } else if (signal) {
      console.error(`Admin backend exited with signal ${signal}.`);
    }
  });

  backendProcess.on('error', (error) => {
    backendProcess = null;
    console.error('Failed to start admin backend.', error);
  });
};

const stopBackend = () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
    backendProcess = null;
  }
};

const registerIpcHandlers = () => {
  ipcMain.handle('shell:openExternal', (event, url) => {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL.');
    }
    return shell.openExternal(url);
  });
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 1024,
    minHeight: 720,
    autoHideMenuBar: true,
    backgroundColor: '#f4f1ea',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.setAppUserModelId('com.ace.admin');

app.whenReady().then(() => {
  startBackend();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});
