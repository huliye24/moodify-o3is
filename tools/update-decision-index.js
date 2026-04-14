#!/usr/bin/env node
/**
 * 决策索引更新工具
 * 
 * 自动扫描 decisions/ 目录，更新 INDEX.md
 * 
 * 用法: node tools/update-decision-index.js
 */

const fs = require('fs');
const path = require('path');

const DECISIONS_DIR = path.join(__dirname, '..', 'decisions');

function extractMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const idMatch = content.match(/\*\*ID\*\*:\s*([A-Z]\d+)/);
    const statusMatch = content.match(/\*\*状态\*\*:\s*(\w+)/);
    const dateMatch = content.match(/\*\*日期\*\*:\s*([\d-]+)/);
    const titleMatch = content.match(/^#\s+(D\d+):\s+(.+)$/m);
    
    return {
        id: idMatch ? idMatch[1] : null,
        status: statusMatch ? statusMatch[1] : null,
        date: dateMatch ? dateMatch[1] : null,
        title: titleMatch ? titleMatch[2] : null,
        filename: path.basename(filePath)
    };
}

function generateIndex() {
    const files = fs.readdirSync(DECISIONS_DIR)
        .filter(f => f.match(/^D\d+\.md$/))
        .map(f => path.join(DECISIONS_DIR, f));
    
    const decisions = files.map(f => extractMetadata(f))
        .filter(d => d.id)
        .sort((a, b) => a.id.localeCompare(b.id));
    
    let markdown = `# 决策索引\n\n`;
    markdown += `> 自动生成于 ${new Date().toISOString()}\n\n`;
    markdown += `## 概览\n\n`;
    markdown += `| ID | 标题 | 状态 | 日期 |\n`;
    markdown += `|------|------|------|------|\n`;
    
    for (const d of decisions) {
        markdown += `| ${d.id} | [${d.title}](./${d.filename}) | ${d.status} | ${d.date} |\n`;
    }
    
    markdown += `\n## 按状态分类\n\n`;
    
    const byStatus = {};
    for (const d of decisions) {
        if (!byStatus[d.status]) byStatus[d.status] = [];
        byStatus[d.status].push(d);
    }
    
    for (const [status, items] of Object.entries(byStatus)) {
        markdown += `### ${status}\n\n`;
        for (const d of items) {
            markdown += `- [${d.id}](./${d.filename}): ${d.title}\n`;
        }
        markdown += `\n`;
    }
    
    markdown += `---\n\n`;
    markdown += `*此文件由 tools/update-decision-index.js 自动生成*\n`;
    
    fs.writeFileSync(path.join(DECISIONS_DIR, 'INDEX.md'), markdown, 'utf-8');
    console.log('✅ 决策索引已更新');
}

generateIndex();
