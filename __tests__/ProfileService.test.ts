import { getProfile, updateProfile, uploadAvatar } from '../app/services/profileService';
import { supabase } from '../app/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

// Mock Supabase
jest.mock('../app/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/avatar.jpg' }
        })
      })
    }
  }
}));

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'images' }
}));

// Mock fetch for blob conversion
global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue('mock-blob')
});

describe('Profile Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch a user profile successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        notifications_enabled: true,
        updated_at: '2023-01-01T00:00:00.000Z'
      };

      supabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await getProfile('user-123');
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockProfile);
    });

    it('should return null when there is an error', async () => {
      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' }
      });

      const result = await getProfile('user-123');
      
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update a user profile successfully', async () => {
      const mockUpdatedProfile = {
        id: 'user-123',
        username: 'newusername',
        avatar_url: 'https://example.com/avatar.jpg',
        notifications_enabled: false,
        updated_at: '2023-01-02T00:00:00.000Z'
      };

      supabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null
      });

      const updates = {
        username: 'newusername',
        notifications_enabled: false
      };

      const result = await updateProfile('user-123', updates);
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from().update).toHaveBeenCalled();
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should return null when there is an error', async () => {
      supabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      const result = await updateProfile('user-123', { username: 'newname' });
      
      expect(result).toBeNull();
    });
  });

  describe('uploadAvatar', () => {
    it('should upload an avatar successfully', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://local/image.jpg' }]
      });

      supabase.storage.from().upload.mockResolvedValue({
        data: { path: 'avatars/user-123-timestamp.jpg' },
        error: null
      });

      // Mock the updateProfile function
      jest.spyOn(global, 'updateProfile' as any).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        notifications_enabled: true,
        updated_at: '2023-01-01T00:00:00.000Z'
      });

      const result = await uploadAvatar('user-123');
      
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(supabase.storage.from().upload).toHaveBeenCalled();
      expect(result).toBe('https://example.com/avatar.jpg');
    });

    it('should return null when image picker is canceled', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: []
      });

      const result = await uploadAvatar('user-123');
      
      expect(result).toBeNull();
      expect(supabase.storage.from().upload).not.toHaveBeenCalled();
    });

    it('should return null when upload fails', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://local/image.jpg' }]
      });

      supabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      });

      const result = await uploadAvatar('user-123');
      
      expect(result).toBeNull();
    });
  });
});