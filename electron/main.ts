import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';

const isDev = !app.isPackaged;
let backendProcess: ChildProcess | null = null;
let backendPort = 3000;
let mainWindow: BrowserWindow | null = null;

function waitForBackend(port: number, maxAttempts = 30): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(`http://localhost:${port}/health`, (res) => {
        if (res.statusCode === 200) resolve();
        else retry();
      });
      req.on('error', retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error('Backend não iniciou a tempo'));
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  });
}

async function startBackend() {
  if (isDev) {
    // Em desenvolvimento, o backend já deve estar rodando
    return;
  }

  const backendPath = path.join(process.resourcesPath, 'backend');
  const nodeModules = path.join(backendPath, 'node_modules');

  backendProcess = spawn('node', [path.join(backendPath, 'dist', 'main.js')], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(backendPort),
      DATABASE_URL: `file:${path.join(app.getPath('userData'), 'agenda.db')}`,
    },
    stdio: 'pipe',
  });

  backendProcess.stdout?.on('data', (d) => console.log('[backend]', d.toString()));
  backendProcess.stderr?.on('data', (d) => console.error('[backend]', d.toString()));

  await waitForBackend(backendPort);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('get-api-url', () => `http://localhost:${backendPort}`);

app.whenReady().then(async () => {
  await startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  backendProcess?.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  backendProcess?.kill();
});
