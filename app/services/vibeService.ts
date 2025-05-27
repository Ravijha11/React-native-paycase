import { supabase } from '../lib/supabase';

export type Vibe = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string;
  };
};

import { EXPO_PUBLIC_SUPABASE_URL } from '@env';

const EDGE_FUNCTION_URL = `${EXPO_PUBLIC_SUPABASE_URL}/functions/v1/vibes`;

export const getVibes = async (page = 1, limit = 10): Promise<Vibe[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(`${EDGE_FUNCTION_URL}?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vibes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching vibes:', error);
    return [];
  }
};

export const getVibe = async (id: string): Promise<Vibe | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(`${EDGE_FUNCTION_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vibe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching vibe:', error);
    return null;
  }
};

export const createVibe = async (content: string): Promise<Vibe | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create vibe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating vibe:', error);
    return null;
  }
};

export const updateVibe = async (id: string, content: string): Promise<Vibe | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(`${EDGE_FUNCTION_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vibe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating vibe:', error);
    return null;
  }
};

export const deleteVibe = async (id: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(`${EDGE_FUNCTION_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete vibe');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting vibe:', error);
    return false;
  }
};