const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
env.VITE_DEV_SERVER_URL = env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

const child = spawn(electron, [path.join(__dirname, 'main.js')], {
  stdio: 'inherit',
  env
});

child.on('error', (error) => {
  console.error('Failed to launch Electron.', error);
  process.exit(1);
});

child.on('close', (code, signal) => {
  if (code === null) {
    console.error('Electron exited with signal', signal);
    process.exit(1);
  }
  process.exit(code);
});
