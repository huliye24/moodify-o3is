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

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('desktopAPI', {
    // 获取应用信息
    getAppInfo: () => ipcRenderer.invoke('app:getInfo'),

    // 检查音乐文件是否存在
    musicExists: (filename) => ipcRenderer.invoke('app:musicExists', filename),

    // 获取音乐文件夹路径
    getMusicPath: () => ipcRenderer.invoke('app:getMusicPath'),

    // 获取音乐文件列表
    getMusicFiles: () => ipcRenderer.invoke('app:getMusicFiles'),

    // 选择音乐文件夹
    selectMusicFolder: () => ipcRenderer.invoke('app:selectMusicFolder'),

    // 获取当前平台
    platform: process.platform,

    // 是否为桌面环境
    isDesktop: true
});

console.log('Moodify 桌面端预加载脚本已加载');
