const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');
const updater = require('./updater');

let backendProcess = null;
let mainWindow = null;
let setupWindow = null;
const BACKEND_PORT = '4000';
let backendLog = '';

// Turns the admin server's startup error into something a person can act on.
const explainBackendFailure = (log) => {
  if (/IP that isn't whitelisted|not authorized|whitelist|ReplicaSetNoPrimary|Server selection timed out|MongoServerSelectionError/i.test(log)) {
    return "The app couldn't connect to the database. Most often this computer's internet address isn't allowed in MongoDB Atlas: open Atlas, go to Network Access and add your current IP address. Also check that you're online.";
  }
  if (/bad auth|Authentication failed/i.test(log)) {
    return 'The database rejected the username or password in the database link. Open Settings and paste the correct database connection string.';
  }
  if (/querySrv|queryTxt|ENOTFOUND|ESERVFAIL|ETIMEOUT/i.test(log)) {
    return "The app couldn't look up the database address. Check that you're online, then try again.";
  }
  if (/MONGODB_URI|JWT_SECRET|ADMIN_EMAIL|ADMIN_PASSWORD/.test(log)) {
    return 'Some settings are missing. Open Settings and fill them in.';
  }
  if (/EADDRINUSE/.test(log)) {
    return 'Another copy of the admin server is already running. Close every ACE Admin window (and any "npm start" window for the admin server), then open the app again.';
  }
  if (/Cannot find module/.test(log)) {
    return 'The app is missing some of its files. Reinstall ACE Admin.';
  }
  return 'The admin server stopped while starting.';
};

const resolveBackendPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'admin-backend');
  }
  return path.join(__dirname, '..', '..', 'admin-backend');
};

// During development the admin server can still read its own .env file.
const hasDevEnvFile = () => !app.isPackaged && fs.existsSync(path.join(resolveBackendPath(), '.env'));

const startBackend = () => {
  if (backendProcess) {
    return;
  }

  const backendPath = resolveBackendPath();
  const entryPoint = path.join(backendPath, 'server.js');
  const saved = settings.readSettings(app) || {};
  const env = {
    ...process.env,
    ...saved,
    PORT: BACKEND_PORT,
    HOST: '127.0.0.1',
    ELECTRON_RUN_AS_NODE: '1'
  };

  backendLog = '';
  backendProcess = spawn(process.execPath, [entryPoint], {
    cwd: backendPath,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  const keepLog = (chunk) => {
    backendLog = (backendLog + chunk.toString()).slice(-4000);
  };
  backendProcess.stdout.on('data', (chunk) => {
    keepLog(chunk);
    process.stdout.write(chunk);
  });
  backendProcess.stderr.on('data', (chunk) => {
    keepLog(chunk);
    process.stderr.write(chunk);
  });

  const thisProcess = backendProcess;
  thisProcess.on('exit', (code, signal) => {
    if (backendProcess === thisProcess) backendProcess = null;
    if (thisProcess.stoppedOnPurpose) return;
    if (code !== null && code !== 0) {
      console.error(`Admin backend exited with code ${code}.`);
      const detail = backendLog.split(/\r?\n/).filter((line) => /error|Error|failed/.test(line)).slice(-3).join('\n');
      dialog
        .showMessageBox(mainWindow || undefined, {
          type: 'error',
          title: 'ACE Admin',
          message: explainBackendFailure(backendLog),
          detail: detail ? `Details:\n${detail.slice(0, 600)}` : undefined,
          buttons: ['Try again', 'Open settings', 'Close'],
          defaultId: 0,
          cancelId: 2
        })
        .then(({ response }) => {
          if (response === 0) {
            startBackend();
            setTimeout(() => mainWindow?.reload(), 4000);
          } else if (response === 1) {
            openSetupWindow();
          }
        })
        .catch(() => {});
    } else if (signal) {
      console.error(`Admin backend exited with signal ${signal}.`);
    }
  });

  thisProcess.on('error', (error) => {
    if (backendProcess === thisProcess) backendProcess = null;
    console.error('Failed to start admin backend.', error);
  });
};

const stopBackend = () =>
  new Promise((resolve) => {
    if (!backendProcess || backendProcess.killed) {
      backendProcess = null;
      resolve();
      return;
    }
    backendProcess.stoppedOnPurpose = true;
    backendProcess.once('exit', () => resolve());
    backendProcess.kill();
    backendProcess = null;
    setTimeout(resolve, 1500);
  });

// Only links the app actually uses: web pages, phone calls, WhatsApp and email.
const SAFE_PROTOCOLS = new Set(['https:', 'http:', 'tel:', 'mailto:', 'whatsapp:']);

const secureWebPreferences = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  preload: path.join(__dirname, 'preload.js')
};

// Keep every window on the app's own pages; anything else opens in the browser.
const lockNavigation = (win, allowedPrefix) => {
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (SAFE_PROTOCOLS.has(new URL(url).protocol)) shell.openExternal(url);
    } catch {
      /* ignore malformed links */
    }
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(allowedPrefix)) event.preventDefault();
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 400,
    minHeight: 560,
    autoHideMenuBar: true,
    title: 'ACE Admin',
    backgroundColor: '#f4f6f8',
    webPreferences: secureWebPreferences
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devServerUrl) {
    lockNavigation(mainWindow, devServerUrl);
    mainWindow.loadURL(devServerUrl);
  } else {
    const file = path.join(__dirname, '../dist/index.html');
    lockNavigation(mainWindow, 'file://');
    mainWindow.loadFile(file);
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const openSetupWindow = () => {
  if (setupWindow) {
    setupWindow.focus();
    return;
  }
  setupWindow = new BrowserWindow({
    width: 600,
    height: 720,
    minWidth: 380,
    minHeight: 520,
    autoHideMenuBar: true,
    title: 'Set up ACE Admin',
    parent: mainWindow || undefined,
    modal: Boolean(mainWindow),
    backgroundColor: '#f4f6f8',
    webPreferences: secureWebPreferences
  });
  lockNavigation(setupWindow, 'file://');
  setupWindow.loadFile(path.join(__dirname, 'setup.html'));
  setupWindow.on('closed', () => {
    setupWindow = null;
    // Closed on first run without saving: nothing to open, so quit.
    if (!mainWindow && !settings.isComplete(settings.readSettings(app)) && !hasDevEnvFile()) app.quit();
  });
};

const registerIpcHandlers = () => {
  ipcMain.handle('shell:openExternal', (event, url) => {
    let parsed;
    try {
      parsed = new URL(String(url || ''));
    } catch {
      throw new Error('Invalid link.');
    }
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
      throw new Error('This kind of link is not allowed.');
    }
    return shell.openExternal(parsed.toString());
  });

  ipcMain.handle('settings:open', () => openSetupWindow());
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('updates:check', () => updater.check(true));

  // Current values for the setup form. The password and signing key stay hidden.
  ipcMain.handle('setup:load', () => {
    const saved = settings.readSettings(app) || {};
    return {
      MONGODB_URI: saved.MONGODB_URI || '',
      ADMIN_EMAIL: saved.ADMIN_EMAIL || '',
      AWS_ACCESS_KEY_ID: saved.AWS_ACCESS_KEY_ID || '',
      hasPassword: Boolean(saved.ADMIN_PASSWORD),
      hasAwsSecret: Boolean(saved.AWS_SECRET_ACCESS_KEY)
    };
  });

  ipcMain.handle('setup:import', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win, {
      title: 'Choose the admin server .env file',
      properties: ['openFile', 'showHiddenFiles']
    });
    if (result.canceled || !result.filePaths[0]) return null;
    try {
      const values = settings.parseEnv(fs.readFileSync(result.filePaths[0], 'utf8'));
      if (!values.MONGODB_URI) return { error: 'That file has no MONGODB_URI line. Choose the admin server .env file.' };
      const picked = {};
      settings.KEYS.forEach((key) => {
        if (values[key]) picked[key] = values[key];
      });
      return { values: picked };
    } catch {
      return { error: "Couldn't read that file." };
    }
  });

  ipcMain.handle('setup:save', async (event, input) => {
    const previous = settings.readSettings(app) || {};
    // Fields left empty keep their saved value (so passwords and keys needn't be retyped).
    const values = { ...previous };
    Object.entries(input || {}).forEach(([key, value]) => {
      if (settings.KEYS.includes(key) && String(value || '').trim()) values[key] = String(value).trim();
    });
    const errors = settings.validate(values);
    if (Object.keys(errors).length) return { errors };
    settings.writeSettings(app, values);

    await stopBackend();
    startBackend();
    if (mainWindow) {
      mainWindow.reload();
    } else {
      createWindow();
    }
    setupWindow?.close();
    return { ok: true };
  });
};

app.setAppUserModelId('com.ace.admin');

app.whenReady().then(() => {
  registerIpcHandlers();

  if (settings.isComplete(settings.readSettings(app)) || hasDevEnvFile()) {
    startBackend();
    createWindow();
  } else {
    openSetupWindow();
  }

  updater.init({ window: () => mainWindow, onBeforeInstall: stopBackend });

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

// Wait for the admin server to stop before quitting, so an update can replace its files.
app.on('before-quit', (event) => {
  if (!backendProcess) return;
  event.preventDefault();
  stopBackend().then(() => app.quit());
});
