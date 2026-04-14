/**
 * Moodify 桌面端主进程
 *
 * 功能：
 * - 创建桌面窗口加载 Moodify 前端 (Vite dev server 或打包后 dist)
 * - 支持音频播放
 * - 窗口管理（最小化、最大化、关闭）
 * - 自动播放音乐
 *
 * 创建时间：2026-04-10
 * 作者：Moodify
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 获取应用根目录（exe所在目录或开发环境下的项目根目录）
const isDev = !app.isPackaged;
const appRoot = isDev
    ? path.join(__dirname, '..')
    : path.join(app.getAppPath(), '..');

// 应用窗口实例
let mainWindow = null;

/**
 * 创建主窗口
 */
function createWindow() {
    // 开发模式：加载 Vite dev server
    // 生产模式：加载打包后的 dist/index.html
    let loadUrl;
    if (isDev) {
        loadUrl = 'http://localhost:5173';
        console.log('[Moodify] 开发模式: 加载 ' + loadUrl);
    } else {
        const htmlPath = path.join(appRoot, 'dist', 'index.html');
        loadUrl = 'file://' + htmlPath;
        console.log('[Moodify] 生产模式: 加载 ' + loadUrl);
    }

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'Moodify | 情绪的潮汐',
        backgroundColor: '#0a0a0f',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            autoplayPolicy: 'no-user-gesture-required'
        }
    });

    mainWindow.loadURL(loadUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('[Moodify] 桌面端已启动');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

app.whenReady().then(() => {
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
    console.log('[Moodify] 正在退出...');
});

// ============ IPC 通信 ============

// 获取应用信息
ipcMain.handle('app:getInfo', () => {
    return {
        version: app.getVersion(),
        name: app.getName(),
        isDev: isDev,
        musicPath: path.join(appRoot, 'music'),
        userDataPath: app.getPath('userData')
    };
});

// 检查音乐文件是否存在
ipcMain.handle('app:musicExists', async (event, filename) => {
    const musicPath = path.join(appRoot, 'music', filename);
    return fs.existsSync(musicPath);
});

// 获取音乐文件夹路径
ipcMain.handle('app:getMusicPath', () => {
    return path.join(appRoot, 'music');
});

// 获取音乐文件列表
ipcMain.handle('app:getMusicFiles', () => {
    const musicDir = path.join(appRoot, 'music');
    if (!fs.existsSync(musicDir)) {
        return [];
    }
    return fs.readdirSync(musicDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].includes(ext);
    });
});

// 选择音乐文件夹（dialog 方式）
ipcMain.handle('app:selectMusicFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择音乐文件夹',
        properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, path: null, files: [] };
    }

    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].includes(ext);
        })
        .map(file => ({
            name: file,
            path: path.join(folderPath, file),
            url: `file://${path.join(folderPath, file).replace(/\\/g, '/')}`
        }));

    return { success: true, path: folderPath, files };
});

// ============ 前端 API IPC（由 preload 转发） ============
// settings
ipcMain.handle('settings:get', (event, key) => {
    try {
        const Store = require('electron-store');
        const store = new Store();
        return store.get(key);
    } catch { return undefined; }
});
ipcMain.handle('settings:set', (event, key, value) => {
    try {
        const Store = require('electron-store');
        const store = new Store();
        store.set(key, value);
    } catch {}
});
ipcMain.handle('settings:getAll', () => {
    try {
        const Store = require('electron-store');
        const store = new Store();
        return store.store;
    } catch { return {}; }
});
