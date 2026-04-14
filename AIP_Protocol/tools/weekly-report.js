#!/usr/bin/env node
/**
 * 路线图周报生成工具
 * 
 * 生成当前阶段的周报
 * 
 * 用法: node AIP_Protocol/tools/weekly-report.js [week_num] [theme]
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', '2_任务', 'logs');

function getCurrentMonth() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `M${month - 3}`; // 假设从 M1 开始
}

function generateWeeklyReport(weekNum, theme) {
    const now = new Date();
    const month = getCurrentMonth();
    const weekStr = `W${String(weekNum).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    
    const content = `# ${dateStr} 周报 - ${theme}

## 周次

> ${weekStr} | 日期: ${dateStr}

## 目标

本周主题: ${theme}

## 完成内容

- [ ] 

## 遇到的问题

- 

## 下周计划

- [ ] 

## 指标

| 指标 | 目标 | 实际 |
|------|------|------|
| 功能完成 | - | - |
| 测试覆盖 | - | - |
| Bug 修复 | - | - |

---

*此文件由 AIP_Protocol/tools/weekly-report.js 生成*
`;
    
    // 确保目录存在
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    
    const filename = `${dateStr}-${weekStr}-周报.md`;
    const filepath = path.join(LOGS_DIR, filename);
    
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ 周报已创建: ${filepath}`);
    return filepath;
}

const weekNum = process.argv[2] || '1';
const theme = process.argv[3] || getCurrentMonth();

generateWeeklyReport(weekNum, theme);
