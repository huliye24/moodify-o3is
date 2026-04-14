/**
 * Moodify 桌面端预加载脚本
 *
 * 功能：
 * - 暴露安全的 API 给渲染进程
 * - 支持音频播放控制
 * - 提供桌面端特有功能
 *
 * 创建时间：2026-04-10
 * 作者：Moodify
 */

const { contextBridge, ipcRenderer } = require('electron');

// 暴露 desktopAPI（兼容 moodify_web）
contextBridge.exposeInMainWorld('desktopAPI', {
    getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
    musicExists: (filename) => ipcRenderer.invoke('app:musicExists', filename),
    getMusicPath: () => ipcRenderer.invoke('app:getMusicPath'),
    getMusicFiles: () => ipcRenderer.invoke('app:getMusicFiles'),
    selectMusicFolder: () => ipcRenderer.invoke('app:selectMusicFolder'),
    platform: process.platform,
    isDesktop: true
});

// 暴露 api（兼容 src/ 前端 TypeScript 定义）
contextBridge.exposeInMainWorld('api', {
    dialog: {
        openDirectory: () => ipcRenderer.invoke('app:selectMusicFolder').then(r => r?.path ?? null),
        openFile: () => Promise.resolve([]),
    },
    settings: {
        get: (key) => ipcRenderer.invoke('settings:get', key),
        set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
        getAll: () => ipcRenderer.invoke('settings:getAll'),
    },
    window: {
        openPlayer: () => {},
        openWeb: () => {},
        openMain: () => {},
    },
    shell: {
        openExternal: (url) => require('electron').shell.openExternal(url),
    },
    deepseek: {
        generate: (params) => ipcRenderer.invoke('deepseek:generate', params),
        getApiKey: () => ipcRenderer.invoke('deepseek:getApiKey'),
        setApiKey: (key) => ipcRenderer.invoke('deepseek:setApiKey', key),
    },
    suno: {
        submit: (params) => ipcRenderer.invoke('suno:submit', params),
        fetch: (ids) => ipcRenderer.invoke('suno:fetch', ids),
        getApiKey: () => ipcRenderer.invoke('suno:getApiKey'),
        setApiKey: (key) => ipcRenderer.invoke('suno:setApiKey', key),
        getBaseUrl: () => ipcRenderer.invoke('suno:getBaseUrl'),
        setBaseUrl: (url) => ipcRenderer.invoke('suno:setBaseUrl', url),
        onProgress: (callback) => {
            const handler = (e, data) => callback(e, data);
            ipcRenderer.on('suno:progress', handler);
            return () => ipcRenderer.removeListener('suno:progress', handler);
        },
    },
    // 音乐库相关接口，main 进程通过 HTTP 调用后端 API
    library: {
        openFolder: () => ipcRenderer.invoke('app:selectMusicFolder').then(r => r?.path ?? null),
        scanFolder: (folderPath) => ipcRenderer.invoke('library:scan', folderPath),
        getAudioMetadata: (filePath) => ipcRenderer.invoke('library:metadata', filePath),
        getLibraryStats: () => ipcRenderer.invoke('library:stats'),
    },
});

console.log('[Moodify] 预加载脚本已加载');
