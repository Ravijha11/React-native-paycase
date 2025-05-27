import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  notifications_enabled: boolean;
  updated_at: string;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'updated_at'>>
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
};

export const uploadAvatar = async (userId: string): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const uri = result.assets[0].uri;
    const fileExt = uri.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    // Update profile with new avatar URL
    await updateProfile(userId, { avatar_url: data.publicUrl });
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in avatar upload process:', error);
    return null;
  }
};