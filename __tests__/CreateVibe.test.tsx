import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateVibeScreen from '../app/create-vibe';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { createVibe } from '../app/services/vibeService';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('../app/services/vibeService', () => ({
  createVibe: jest.fn(),
}));

jest.mock('../app/context/SubscriptionContext', () => ({
  useSubscription: jest.fn().mockReturnValue({
    isPro: false,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('CreateVibeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<CreateVibeScreen />);
    
    expect(getByText('Create Vibe')).toBeTruthy();
    expect(getByPlaceholderText("What's your vibe today?")).toBeTruthy();
    expect(getByText('0/280')).toBeTruthy();
    expect(getByText('Post')).toBeTruthy();
  });

  it('shows error when submitting empty content', async () => {
    const { getByText } = render(<CreateVibeScreen />);
    
    fireEvent.press(getByText('Post'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter some content');
    expect(createVibe).not.toHaveBeenCalled();
  });

  it('shows upgrade prompt for non-pro users with long content', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateVibeScreen />);
    
    const input = getByPlaceholderText("What's your vibe today?");
    const longText = 'This is a very long vibe that exceeds the character limit for non-pro users. It should trigger the upgrade prompt when the user tries to submit it. The limit is 140 characters for non-pro users.';
    
    fireEvent.changeText(input, longText);
    fireEvent.press(getByText('Post'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Pro Feature', 
      'Only Pro users can create vibes longer than 140 characters. Upgrade to Pro?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: expect.any(Function) }
      ]
    );
    
    // Simulate clicking the Upgrade button
    const upgradeCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
    upgradeCallback();
    
    expect(router.push).toHaveBeenCalledWith('/subscription');
    expect(createVibe).not.toHaveBeenCalled();
  });

  it('allows pro users to submit long content', async () => {
    // Override the mock to make user a pro user
    jest.mock('../app/context/SubscriptionContext', () => ({
      useSubscription: jest.fn().mockReturnValue({
        isPro: true,
      }),
    }));
    
    const { getByText, getByPlaceholderText } = render(<CreateVibeScreen />);
    
    const input = getByPlaceholderText("What's your vibe today?");
    const longText = 'This is a very long vibe that exceeds the character limit for non-pro users. It should be allowed for pro users.';
    
    fireEvent.changeText(input, longText);
    
    createVibe.mockResolvedValueOnce({ id: 'new-vibe-id' });
    
    fireEvent.press(getByText('Post'));
    
    await waitFor(() => {
      expect(createVibe).toHaveBeenCalledWith(longText);
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Vibe created successfully');
      expect(router.back).toHaveBeenCalled();
    });
  });

  it('shows error when vibe creation fails', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateVibeScreen />);
    
    const input = getByPlaceholderText("What's your vibe today?");
    fireEvent.changeText(input, 'Test vibe');
    
    createVibe.mockRejectedValueOnce(new Error('Network error'));
    
    fireEvent.press(getByText('Post'));
    
    await waitFor(() => {
      expect(createVibe).toHaveBeenCalledWith('Test vibe');
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create vibe');
    });
  });
});