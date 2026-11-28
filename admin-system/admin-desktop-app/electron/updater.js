// Keeps the installed admin app up to date from the GitHub releases of this repo.
// New versions download in the background; the person chooses when to restart.
const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

const CHECK_EVERY_MS = 4 * 60 * 60 * 1000; // every 4 hours while the app is open

let getWindow = () => null;
let beforeInstall = async () => {};
let manualCheck = false;
let promptShown = false;

const showBox = (options) => {
  const win = getWindow();
  return win ? dialog.showMessageBox(win, options) : dialog.showMessageBox(options);
};

const check = async (manual = false) => {
  if (!app.isPackaged) {
    if (manual) await showBox({ type: 'info', title: 'ACE Admin', message: 'Updates only work in the installed app.' });
    return;
  }
  manualCheck = manual;
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Update check failed', error);
    if (manual) {
      await showBox({
        type: 'warning',
        title: 'ACE Admin',
        message: "Couldn't check for updates. Check that you're online and try again later."
      });
    }
    manualCheck = false;
  }
};

const init = ({ window, onBeforeInstall }) => {
  getWindow = window;
  beforeInstall = onBeforeInstall || beforeInstall;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = console;

  autoUpdater.on('update-not-available', () => {
    if (manualCheck) {
      showBox({ type: 'info', title: 'ACE Admin', message: `You have the latest version (${app.getVersion()}).` });
    }
    manualCheck = false;
  });

  autoUpdater.on('update-available', (info) => {
    if (manualCheck) {
      showBox({
        type: 'info',
        title: 'ACE Admin',
        message: `Version ${info.version} is downloading. You'll be asked to restart when it's ready.`
      });
    }
    manualCheck = false;
  });

  autoUpdater.on('error', (error) => console.error('Updater error', error));

  autoUpdater.on('update-downloaded', async (info) => {
    if (promptShown) return;
    promptShown = true;
    const { response } = await showBox({
      type: 'info',
      title: 'Update ready',
      message: `ACE Admin ${info.version} is ready.`,
      detail: 'Restart now to use it, or keep working. It will also install the next time you close the app.',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });
    promptShown = false;
    if (response === 0) {
      await beforeInstall();
      autoUpdater.quitAndInstall(true, true);
    }
  });

  setTimeout(() => check(false), 5000);
  setInterval(() => check(false), CHECK_EVERY_MS);
};

module.exports = { init, check };
