#!/usr/bin/env node
/**
 * 决策验证工具
 * 
 * 检查决策文件格式和完整性
 * 
 * 用法: node tools/validate-decisions.js
 */

const fs = require('fs');
const path = require('path');

const DECISIONS_DIR = path.join(__dirname, '..', 'decisions');

const REQUIRED_FIELDS = [
    'ID',
    '状态',
    '日期'
];

const VALID_STATUSES = [
    'proposed',
    'approved',
    'deprecated',
    'reverted',
    'superseded'
];

function validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    const warnings = [];
    
    // 检查必填字段
    for (const field of REQUIRED_FIELDS) {
        const regex = new RegExp(`\\*\\*${field}\\*\\*:\\s*(.+)`);
        const match = content.match(regex);
        if (!match) {
            errors.push(`缺少必填字段: ${field}`);
        }
    }
    
    // 检查状态值
    const statusMatch = content.match(/\*\*状态\*\*:\s*(\w+)/);
    if (statusMatch) {
        const status = statusMatch[1];
        if (!VALID_STATUSES.includes(status)) {
            errors.push(`无效的状态值: ${status}`);
        }
    }
    
    // 检查约束契约
    if (!content.includes('```yaml') && !content.includes('```json')) {
        warnings.push('缺少约束契约');
    }
    
    return { errors, warnings };
}

function main() {
    const files = fs.readdirSync(DECISIONS_DIR)
        .filter(f => f.match(/^D\d+\.md$/))
        .map(f => path.join(DECISIONS_DIR, f));
    
    let hasErrors = false;
    
    console.log('🔍 检查决策文件...\n');
    
    for (const file of files) {
        const { errors, warnings } = validateFile(file);
        const filename = path.basename(file);
        
        if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ ${filename}`);
            for (const e of errors) {
                console.log(`   - ${e}`);
            }
        } else {
            console.log(`✅ ${filename}`);
        }
        
        if (warnings.length > 0) {
            for (const w of warnings) {
                console.log(`   ⚠️  ${w}`);
            }
        }
    }
    
    console.log('\n' + (hasErrors ? '❌ 有错误需要修复' : '✅ 所有检查通过'));
    process.exit(hasErrors ? 1 : 0);
}

main();
