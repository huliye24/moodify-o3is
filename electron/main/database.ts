import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

let db: PrismaClient | null = null

// 初始化 SQL
const INIT_SQL = `
CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL UNIQUE,
  applied_on TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Lyrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  style TEXT,
  emotion TEXT,
  promptTemplate TEXT,
  favorite INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lyrics_projectId ON Lyrics(projectId);
CREATE INDEX IF NOT EXISTS idx_lyrics_favorite ON Lyrics(favorite);

CREATE TABLE IF NOT EXISTS MusicTrack (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  o3icsId INTEGER NOT NULL,
  taskId TEXT,
  sunoSongId TEXT,
  title TEXT NOT NULL,
  audioUrl TEXT,
  videoUrl TEXT,
  coverImageUrl TEXT,
  status TEXT DEFAULT 'pending',
  failReason TEXT,
  style TEXT,
  model TEXT,
  instrumental INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (o3icsId) REFERENCES Lyrics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_musicTrack_o3icsId ON MusicTrack(o3icsId);
CREATE INDEX IF NOT EXISTS idx_musicTrack_taskId ON MusicTrack(taskId);
CREATE INDEX IF NOT EXISTS idx_musicTrack_status ON MusicTrack(status);

CREATE TABLE IF NOT EXISTS Rule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rule_type ON Rule(type);
CREATE INDEX IF NOT EXISTS idx_rule_isActive ON Rule(isActive);

CREATE TABLE IF NOT EXISTS ApiLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  status TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_apiLog_createdAt ON ApiLog(createdAt);
CREATE INDEX IF NOT EXISTS idx_apiLog_status ON ApiLog(status);
`

export async function initDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'moodify.db')

  // 确保目录存在
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  db = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })

  try {
    await db.$connect()
    console.log('数据库连接成功，路径:', dbPath)

    // 确保表存在
    await ensureTables()
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

async function ensureTables(): Promise<void> {
  if (!db) return

  try {
    // 使用 Prisma 执行初始化 SQL
    // 这里我们使用原生 SQL 来创建表
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Project (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        tags TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );
    `)
  } catch (e) {
    // 表可能已存在，忽略错误
  }

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Lyrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        style TEXT,
        emotion TEXT,
        promptTemplate TEXT,
        favorite INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
      );
    `)
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Rule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );
    `)
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MusicTrack (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        o3icsId INTEGER NOT NULL,
        taskId TEXT,
        sunoSongId TEXT,
        title TEXT NOT NULL,
        audioUrl TEXT,
        videoUrl TEXT,
        coverImageUrl TEXT,
        status TEXT DEFAULT 'pending',
        failReason TEXT,
        style TEXT,
        model TEXT,
        instrumental INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (o3icsId) REFERENCES Lyrics(id) ON DELETE CASCADE
      );
    `)
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ApiLog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model TEXT NOT NULL,
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        status TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `)
  } catch (e) {}

  console.log('数据库表检查完成')
}

export function getDb(): PrismaClient | null {
  return db
}