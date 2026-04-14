"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");

// DeepSeek API 代理转发（前端直接调 /api/deepseek）
const api = {
    // ============ 窗口管理 ============
    window: {
        openPlayer: () => electron_1.ipcRenderer.invoke('window:openPlayer'),
        openWeb: () => electron_1.ipcRenderer.invoke('window:openWeb'),
        openMain: () => electron_1.ipcRenderer.invoke('window:openMain'),
    },
    // ============ 外部链接 ============
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url),
    },
    // ============ DeepSeek API (代理转发) ============
    deepseek: {
        generate: (params) => electron_1.ipcRenderer.invoke('deepseek:generate', params),
        getApiKey: () => electron_1.ipcRenderer.invoke('deepseek:getApiKey'),
        setApiKey: (apiKey) => electron_1.ipcRenderer.invoke('deepseek:setApiKey', apiKey),
    },
    // ============ Suno API ============
    suno: {
        submit: (params) => electron_1.ipcRenderer.invoke('suno:submit', params),
        fetch: (taskIds) => electron_1.ipcRenderer.invoke('suno:fetch', taskIds),
        getApiKey: () => electron_1.ipcRenderer.invoke('suno:getApiKey'),
        setApiKey: (apiKey) => electron_1.ipcRenderer.invoke('suno:setApiKey', apiKey),
        getBaseUrl: () => electron_1.ipcRenderer.invoke('suno:getBaseUrl'),
        setBaseUrl: (baseUrl) => electron_1.ipcRenderer.invoke('suno:setBaseUrl', baseUrl),
        onProgress: (callback) => {
            electron_1.ipcRenderer.on('suno:progress', callback);
            return () => electron_1.ipcRenderer.removeListener('suno:progress', callback);
        },
    },
    // ============ 设置 ============
    settings: {
        get: (key) => electron_1.ipcRenderer.invoke('settings:get', key),
        set: (key, value) => electron_1.ipcRenderer.invoke('settings:set', key, value),
        getAll: () => electron_1.ipcRenderer.invoke('settings:getAll'),
    },
    // ============ 本地音乐库文件操作（方案C用） ============
    library: {
        // 打开文件夹选择对话框
        openFolder: () => electron_1.ipcRenderer.invoke('library:openFolder'),
        // 获取库目录路径
        getLibraryPath: () => electron_1.ipcRenderer.invoke('library:getLibraryPath'),
        // 扫描文件夹中的音频文件
        scanFolder: (folderPath) => electron_1.ipcRenderer.invoke('library:scanFolder', folderPath),
        // 读取音频文件信息（ID3标签等）
        getAudioMetadata: (filePath) => electron_1.ipcRenderer.invoke('library:getAudioMetadata', filePath),
        // 获取文件内容（用于播放）
        readAudioFile: (filePath) => electron_1.ipcRenderer.invoke('library:readAudioFile', filePath),
        // 获取封面图片
        getCoverImage: (coverPath) => electron_1.ipcRenderer.invoke('library:getCoverImage', coverPath),
        // 获取歌词文件
        getLyricsFile: (o3icsPath) => electron_1.ipcRenderer.invoke('library:getLyricsFile', o3icsPath),
        // 复制文件到库目录
        importFile: (sourcePath, destFolder) => electron_1.ipcRenderer.invoke('library:importFile', sourcePath, destFolder),
        // 删除库中的文件
        deleteFile: (filePath) => electron_1.ipcRenderer.invoke('library:deleteFile', filePath),
        // 获取库统计信息
        getLibraryStats: () => electron_1.ipcRenderer.invoke('library:getLibraryStats'),
    },
    // ============ 文件对话框 ============
    dialog: {
        openFile: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
        openDirectory: () => electron_1.ipcRenderer.invoke('dialog:openDirectory'),
    },
    // ============ HTTP 代理 (用于 /api/xxx 路由) ============
    http: {
        get: (url) => electron_1.ipcRenderer.invoke('http:get', url),
        post: (url, body) => electron_1.ipcRenderer.invoke('http:post', url, body),
        delete: (url) => electron_1.ipcRenderer.invoke('http:delete', url),
        request: (options) => electron_1.ipcRenderer.invoke('http:request', options),
    },
};
electron_1.contextBridge.exposeInMainWorld('api', api);
