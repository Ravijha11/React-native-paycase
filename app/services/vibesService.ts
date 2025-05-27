import { supabase } from '../lib/supabase';
import * as SQLite from 'expo-sqlite';

export type Vibe = {
  id: string;
  content: string;
  created_at: string;
  profile_id: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
};

// Open a local SQLite database
const db = SQLite.openDatabase('vibes.db');

// Initialize the local database
export const initializeLocalDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS vibes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          profile_id TEXT NOT NULL,
          profile_username TEXT,
          profile_avatar_url TEXT
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

// Fetch vibes from the API
export const fetchVibes = async (page = 1, limit = 10): Promise<Vibe[]> => {
  try {
    const { data, error } = await supabase
      .functions.invoke('vibes', {
        method: 'GET',
        body: { page, limit },
      });

    if (error) throw error;

    // Cache the vibes locally
    await cacheVibes(data);
    
    return data;
  } catch (error) {
    console.error('Error fetching vibes:', error);
    
    // If API fails, try to get cached vibes
    return getLocalVibes(page, limit);
  }
};

// Get vibes from local cache
export const getLocalVibes = (page = 1, limit = 10): Promise<Vibe[]> => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM vibes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (_, { rows }) => {
          const vibes = rows._array.map(row => ({
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            profile_id: row.profile_id,
            profile: {
              username: row.profile_username,
              avatar_url: row.profile_avatar_url,
            },
          }));
          resolve(vibes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Cache vibes in local SQLite database
export const cacheVibes = (vibes: Vibe[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      vibes.forEach(vibe => {
        tx.executeSql(
          `INSERT OR REPLACE INTO vibes (
            id, content, created_at, profile_id, profile_username, profile_avatar_url
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            vibe.id,
            vibe.content,
            vibe.created_at,
            vibe.profile_id,
            vibe.profile?.username,
            vibe.profile?.avatar_url,
          ],
          undefined,
          (_, error) => {
            console.error('Error caching vibe:', error);
            return false;
          }
        );
      });
    }, reject, resolve);
  });
};

// Create a new vibe
export const createVibe = async (content: string, profileId: string): Promise<Vibe | null> => {
  try {
    const { data, error } = await supabase
      .functions.invoke('vibes', {
        method: 'POST',
        body: { content, profileId },
      });

    if (error) throw error;

    // Cache the new vibe
    await cacheVibes([data]);
    
    return data;
  } catch (error) {
    console.error('Error creating vibe:', error);
    return null;
  }
};

// Update a vibe
export const updateVibe = async (id: string, content: string): Promise<Vibe | null> => {
  try {
    const { data, error } = await supabase
      .functions.invoke('vibes', {
        method: 'PUT',
        body: { id, content },
      });

    if (error) throw error;

    // Update the cached vibe
    await cacheVibes([data]);
    
    return data;
  } catch (error) {
    console.error('Error updating vibe:', error);
    return null;
  }
};

// Delete a vibe
export const deleteVibe = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .functions.invoke('vibes', {
        method: 'DELETE',
        body: { id },
      });

    if (error) throw error;

    // Remove from local cache
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM vibes WHERE id = ?`,
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting vibe:', error);
    return false;
  }
};