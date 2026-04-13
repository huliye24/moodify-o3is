#!/usr/bin/env node
/**
 * 任务验证脚本
 * 
 * 验证任务文件格式和状态一致性
 * 
 * 用法: node tools/validate-tasks.js
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '..', '..', 'AIP_Protocol', '2_任务');

function validateTaskId(taskId) {
    // 支持 T20260413_001 或 T20260413_001_xxx 格式
    const pattern1 = /^T\d{8}_\d{3}$/;
    const pattern2 = /^T\d{8}_\d{3}_.+$/;
    return pattern1.test(taskId) || pattern2.test(taskId);
}

function validateTaskFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    const warnings = [];
    
    let task;
    try {
        task = JSON.parse(content);
    } catch (e) {
        errors.push(`JSON 解析失败: ${e.message}`);
        return { errors, warnings, task: null };
    }
    
    // 检查必填字段
    const requiredFields = ['task_id', 'tech_node', 'type', 'title', 'created_at', 'status', 'preconditions', 'postconditions'];
    for (const field of requiredFields) {
        if (!task[field]) {
            errors.push(`缺少必填字段: ${field}`);
        }
    }
    
    // 检查 task_id 格式
    if (task.task_id && !validateTaskId(task.task_id)) {
        errors.push(`task_id 格式错误，应为 T{YYYYMMDD}_{NNN}_{description} 格式`);
    }
    
    // 检查状态一致性
    if (task.status === 'completed' && !task.completed_at) {
        errors.push('status 为 completed 但没有 completed_at');
    }
    if (task.status !== 'completed' && task.completed_at) {
        warnings.push('status 不为 completed 但有 completed_at');
    }
    
    // 检查时间一致性
    if (task.completed_at && task.created_at) {
        if (new Date(task.completed_at) < new Date(task.created_at)) {
            errors.push('completed_at 早于 created_at');
        }
    }
    
    return { errors, warnings, task };
}

function main() {
    console.log('🔍 验证任务文件...\n');
    
    if (!fs.existsSync(TASKS_DIR)) {
        console.log(`❌ 任务目录不存在: ${TASKS_DIR}`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(TASKS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(TASKS_DIR, f));
    
    let hasErrors = false;
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const file of files) {
        const { errors, warnings, task } = validateTaskFile(file);
        const filename = path.basename(file);
        totalTasks++;
        
        if (task?.status === 'completed') {
            completedTasks++;
        }
        
        if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ ${filename}`);
            for (const e of errors) {
                console.log(`   - ${e}`);
            }
        } else {
            console.log(`✅ ${filename} (${task?.status || 'unknown'})`);
        }
        
        if (warnings.length > 0) {
            for (const w of warnings) {
                console.log(`   ⚠️  ${w}`);
            }
        }
    }
    
    console.log(`\n📊 统计: ${completedTasks}/${totalTasks} 任务已完成`);
    
    if (hasErrors) {
        console.log('\n❌ 有错误需要修复');
        process.exit(1);
    } else {
        console.log('\n✅ 所有检查通过');
        process.exit(0);
    }
}

main();
