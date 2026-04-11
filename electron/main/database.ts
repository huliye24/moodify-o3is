import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import { join } from 'path'

let db: PrismaClient | null = null

export async function initDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'moodify.db')

  db = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })

  await db.$connect()

  // 初始化默认规则
  const ruleCount = await db.rule.count()
  if (ruleCount === 0) {
    await initDefaultRules(db)
  }
}

async function initDefaultRules(prisma: PrismaClient): Promise<void> {
  const defaultRules = [
    // 情感规则
    {
      name: '悲伤情感',
      type: 'emotion',
      config: JSON.stringify({
        keywords: ['悲伤', '难过', '痛苦', '失落', '伤心', '孤独', '绝望', '哭泣'],
        tone: '忧伤、哀婉',
        mood: 'sad'
      }),
      priority: 10,
      isActive: true
    },
    {
      name: '喜悦情感',
      type: 'emotion',
      config: JSON.stringify({
        keywords: ['开心', '快乐', '高兴', '喜悦', '欢快', '幸福', '兴奋', '快乐'],
        tone: '明朗、轻快',
        mood: 'happy'
      }),
      priority: 10,
      isActive: true
    },
    {
      name: '浪漫情感',
      type: 'emotion',
      config: JSON.stringify({
        keywords: ['爱', '喜欢', '浪漫', '甜蜜', '思念', '心动', '温柔', '深情'],
        tone: '温馨、甜蜜',
        mood: 'romantic'
      }),
      priority: 10,
      isActive: true
    },
    {
      name: '励志情感',
      type: 'emotion',
      config: JSON.stringify({
        keywords: ['努力', '奋斗', '梦想', '坚持', '前进', '拼搏', '希望', '勇气'],
        tone: '昂扬、向上',
        mood: 'inspirational'
      }),
      priority: 10,
      isActive: true
    },
    // 风格规则
    {
      name: '古风风格',
      type: 'style',
      config: JSON.stringify({
        name: '古风',
        description: '用词典雅，意境深远，充满中国传统美学',
        prompts: [
          '使用古典意象：明月、清风、孤灯、流水',
          '善用典故和对仗',
          '语言凝练，富有韵律'
        ]
      }),
      priority: 5,
      isActive: true
    },
    {
      name: '民谣风格',
      type: 'style',
      config: JSON.stringify({
        name: '民谣',
        description: '叙事性强，简洁质朴，富有生活气息',
        prompts: [
          '语言朴实自然，不过分雕琢',
          '善用叙事手法讲述故事',
          '贴近生活，接地气'
        ]
      }),
      priority: 5,
      isActive: true
    },
    {
      name: '流行风格',
      type: 'style',
      config: JSON.stringify({
        name: '流行',
        description: '朗朗上口，情感直接，易于传唱',
        prompts: [
          '语言简洁易懂',
          '情感表达直接',
          '节奏明快，韵律感强'
        ]
      }),
      priority: 5,
      isActive: true
    },
    {
      name: '说唱风格',
      type: 'style',
      config: JSON.stringify({
        name: '说唱',
        description: '节奏感强，押韵密集，表达态度',
        prompts: [
          '大量使用押韵',
          '节奏感强，可配合快节奏',
          '表达鲜明态度和观点'
        ]
      }),
      priority: 5,
      isActive: true
    },
    // 主题规则
    {
      name: '爱情主题',
      type: 'theme',
      config: JSON.stringify({
        name: '爱情',
        keywords: ['恋人', '牵手', '拥抱', '承诺', '分离', '重逢'],
        prompt: '围绕爱情展开，可以是甜蜜、相思、分离或思念'
      }),
      priority: 8,
      isActive: true
    },
    {
      name: '友情主题',
      type: 'theme',
      config: JSON.stringify({
        name: '友情',
        keywords: ['朋友', '陪伴', '兄弟', '姐妹', '青春', '回忆'],
        prompt: '围绕友情展开，体现陪伴、信任和珍贵的情谊'
      }),
      priority: 8,
      isActive: true
    },
    {
      name: '成长主题',
      type: 'theme',
      config: JSON.stringify({
        name: '成长',
        keywords: ['成长', '迷茫', '坚持', '蜕变', '未来', '勇气'],
        prompt: '围绕成长经历，展现从迷茫到坚定的心路历程'
      }),
      priority: 8,
      isActive: true
    },
    {
      name: '自然主题',
      type: 'theme',
      config: JSON.stringify({
        name: '自然',
        keywords: ['天空', '大地', '海洋', '山川', '四季', '星辰'],
        prompt: '以自然景物为载体，寄托情感或哲思'
      }),
      priority: 8,
      isActive: true
    },
    // 韵律规则
    {
      name: 'AABB韵律',
      type: 'rhyme',
      config: JSON.stringify({
        name: 'AABB',
        description: '相邻两句押韵',
        pattern: 'AABB'
      }),
      priority: 3,
      isActive: true
    },
    {
      name: 'ABAB韵律',
      type: 'rhyme',
      config: JSON.stringify({
        name: 'ABAB',
        description: '交错押韵，更具变化',
        pattern: 'ABAB'
      }),
      priority: 3,
      isActive: true
    },
    {
      name: '自由韵律',
      type: 'rhyme',
      config: JSON.stringify({
        name: '自由韵',
        description: '不强制押韵，自由表达',
        pattern: 'free'
      }),
      priority: 3,
      isActive: true
    }
  ]

  for (const rule of defaultRules) {
    await prisma.rule.create({ data: rule })
  }
}

export function getDb(): PrismaClient | null {
  return db
}