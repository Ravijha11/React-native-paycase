import * as SQLite from 'expo-sqlite';
import { Vibe } from './vibeService';

const db = SQLite.openDatabase('vibes.db');

// Initialize database
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS vibes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          username TEXT,
          avatar_url TEXT,
          is_synced INTEGER DEFAULT 1
        )`,
        [],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Save vibes to local cache
export const cacheVibes = (vibes: Vibe[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      vibes.forEach(vibe => {
        tx.executeSql(
          `INSERT OR REPLACE INTO vibes (
            id, content, profile_id, created_at, updated_at, 
            profile_username, profile_avatar_url, is_synced
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            vibe.id, 
            vibe.content, 
            vibe.profile_id, 
            vibe.created_at, 
            vibe.updated_at || null,
            vibe.profile?.username || null,
            vibe.profile?.avatar_url || null
          ],
          () => {},
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
      resolve();
    });
  });
};

// Get cached vibes
export const getCachedVibes = (limit = 20, offset = 0): Promise<Vibe[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM vibes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (_, { rows }) => {
          const vibes = rows._array.map(row => ({
            id: row.id,
            content: row.content,
            profile_id: row.profile_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            profile: row.profile_username || row.profile_avatar_url ? {
              id: row.profile_id,
              username: row.profile_username,
              avatar_url: row.profile_avatar_url
            } : undefined
          }));
          resolve(vibes as Vibe[]);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Clear cache
export const clearCache = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM vibes',
        [],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};