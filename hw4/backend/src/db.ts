import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initDb = async (): Promise<void> => {
  try {
    const dbPath = process.env.DATABASE_PATH || './db.sqlite';
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create locations table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        address TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        notes TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
      CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(lat, lng);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDb = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
};

export const closeDb = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
  }
};
