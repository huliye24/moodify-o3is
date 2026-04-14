#!/usr/bin/env node
/**
 * 仪表盘更新脚本
 * 
 * 自动扫描任务目录，更新仪表盘
 * 
 * 用法: node tools/update-dashboard.js
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '..', '..', 'AIP_Protocol', '2_任务');
const DASHBOARD_PATH = path.join(__dirname, '..', '..', 'AIP_Protocol', '3_共享', 'dashboard.md');
const ROADMAP_PATH = path.join(__dirname, '..', '..', 'AIP_Protocol', '1_roadmap', '技术路线.md');

function getTasks() {
    if (!fs.existsSync(TASKS_DIR)) {
        return [];
    }
    
    return fs.readdirSync(TASKS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const content = fs.readFileSync(path.join(TASKS_DIR, f), 'utf-8');
            try {
                return JSON.parse(content);
            } catch {
                return null;
            }
        })
        .filter(t => t !== null);
}

function countByStatus(tasks) {
    const counts = {
        total: tasks.length,
        completed: 0,
        pending: 0,
        in_progress: 0
    };
    
    for (const task of tasks) {
        switch (task.status) {
            case 'completed':
                counts.completed++;
                break;
            case 'pending':
                counts.pending++;
                break;
            case 'in_progress':
                counts.in_progress++;
                break;
        }
    }
    
    return counts;
}

function getTechNodeStats(tasks) {
    const nodes = {};
    
    for (const task of tasks) {
        const node = task.tech_node || 'unknown';
        if (!nodes[node]) {
            nodes[node] = { total: 0, completed: 0 };
        }
        nodes[node].total++;
        if (task.status === 'completed') {
            nodes[node].completed++;
        }
    }
    
    return nodes;
}

function updateDashboard(tasks) {
    const counts = countByStatus(tasks);
    const nodeStats = getTechNodeStats(tasks);
    
    const now = new Date().toISOString();
    
    let md = `# 全局仪表盘

> 更新: ${now}

## 概览

| 指标 | 值 | 说明 |
|------|-----|------|
| 任务总数 | ${counts.total} | - |
| 已完成 | ${counts.completed} | ✅ |
| 进行中 | ${counts.in_progress} | - |
| 待开始 | ${counts.pending} | - |

## 技术节点状态

| 节点 | 名称 | 状态 | 完成任务 |
|------|------|------|----------|
`;
    
    const nodeNames = {
        'R0': '协议核心结构设计',
        'R1': '任务 JSON Schema',
        'R2': '自检钩子',
        'R3': '示例项目验证',
        'backend': 'Go 后端开发',
        'frontend': '前端开发',
        'bugfix': 'Bug修复',
        'docs': '文档编写',
        'refactor': '重构优化'
    };
    
    for (const [node, stats] of Object.entries(nodeStats)) {
        const name = nodeNames[node] || node;
        const status = stats.completed === stats.total ? '✅ 已完成' : (stats.completed > 0 ? '🟡 进行中' : '⬜ 待开始');
        md += `| ${node} | ${name} | ${status} | ${stats.completed}/${stats.total} |\n`;
    }
    
    md += `
## 活跃任务

`;
    
    const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 5);
    if (pendingTasks.length === 0) {
        md += `无待执行任务\n`;
    } else {
        md += `| 任务ID | 标题 | 状态 | 节点 |\n`;
        md += `|--------|------|------|------|\n`;
        for (const task of pendingTasks) {
            md += `| ${task.task_id} | ${task.title} | ${task.status} | ${task.tech_node} |\n`;
        }
    }
    
    md += `
## 最近事件

| 时间 | 事件 |
|------|------|
`;
    
    const recentTasks = tasks
        .filter(t => t.status === 'completed' && t.completed_at)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        .slice(0, 5);
    
    for (const task of recentTasks) {
        const date = new Date(task.completed_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        md += `| ${date} | ${task.task_id} 完成：${task.title} |\n`;
    }
    
    md += `
## 成功标准进度

| 标准 | 状态 | 说明 |
|------|------|------|
| SC-01 | 🟡 | 协议文档基本完成 |
| SC-02 | 🟢 | Moodify 开发进行中 |
| SC-03 | 🟡 | 连续任务进度: ${counts.completed}/50 |

## 下一步

- **R2**: 完善自检钩子
- **R3**: 用 Moodify 跑通完整流程
`;
    
    fs.writeFileSync(DASHBOARD_PATH, md, 'utf-8');
    console.log(`✅ 仪表盘已更新: ${DASHBOARD_PATH}`);
}

function main() {
    console.log('🔄 更新仪表盘...\n');
    
    const tasks = getTasks();
    console.log(`📊 发现 ${tasks.length} 个任务`);
    
    updateDashboard(tasks);
    
    console.log('\n✅ 仪表盘更新完成');
}

main();
