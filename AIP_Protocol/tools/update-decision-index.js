#!/usr/bin/env node
/**
 * 决策索引更新工具
 * 
 * 自动扫描 AIP_Protocol/0_决策/ 目录，更新 INDEX.md
 * 
 * 用法: node AIP_Protocol/tools/update-decision-index.js
 */

const fs = require('fs');
const path = require('path');

const DECISIONS_DIR = path.join(__dirname, '..', '0_决策');

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
    if (!fs.existsSync(DECISIONS_DIR)) {
        console.log(`❌ 决策目录不存在: ${DECISIONS_DIR}`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(DECISIONS_DIR)
        .filter(f => f.match(/^D\d+.*\.md$/))
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
    markdown += `*此文件由 AIP_Protocol/tools/update-decision-index.js 自动生成*\n`;
    
    const indexPath = path.join(DECISIONS_DIR, 'INDEX.md');
    fs.writeFileSync(indexPath, markdown, 'utf-8');
    console.log(`✅ 决策索引已更新: ${indexPath}`);
    console.log(`📊 共 ${decisions.length} 个决策文档`);
}

generateIndex();
