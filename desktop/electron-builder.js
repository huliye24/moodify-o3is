/**
 * Moodify 桌面端打包配置
 * 
 * 使用 electron-builder 打包桌面应用
 * 
 * 创建时间：2026-04-10
 */

module.exports = {
    appId: 'com.moodify.desktop',
    productName: 'Moodify',
    version: '1.0.0',
    
    // 打包输出目录
    directories: {
        output: 'release/desktop'
    },
    
    // 需要打包的文件
    files: [
        'desktop/**/*',
        'moodify_web/**/*',
        'music/**/*'
    ],
    
    // 排除的文件
    extraResources: [
        {
            from: 'music',
            to: 'music',
            filter: ['**/*']
        }
    ],
    
    // Windows 平台配置
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64']
            }
        ],
        artifactName: '${productName}-${version}-Setup.${ext}'
    },
    
    // NSIS 安装程序配置
    nsis: {
        oneClick: false,
        perMachine: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'Moodify'
    },
    
    // macOS 平台配置
    mac: {
        target: ['dmg'],
        category: 'public.app-category.music'
    },
    
    // Linux 平台配置
    linux: {
        target: ['AppImage'],
        category: 'Audio'
    }
};
