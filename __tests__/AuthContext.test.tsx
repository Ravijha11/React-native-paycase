import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../app/context/AuthContext';
import { Text, Button } from 'react-native';

// Mock supabase
jest.mock('../app/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

const TestComponent = () => {
  const { signIn, signUp, signOut, signInWithGoogle, isLoading, user } = useAuth();
  
  return (
    <>
      <Text testID="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</Text>
      <Text testID="user-state">{user ? 'Logged In' : 'Logged Out'}</Text>
      <Button testID="sign-in" title="Sign In" onPress={() => signIn('test@example.com', 'password')} />
      <Button testID="sign-up" title="Sign Up" onPress={() => signUp('test@example.com', 'password')} />
      <Button testID="sign-out" title="Sign Out" onPress={signOut} />
      <Button testID="google-sign-in" title="Google Sign In" onPress={signInWithGoogle} />
    </>
  );
};

describe('AuthContext', () => {
  it('provides authentication state and methods', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially loading
    expect(getByTestId('loading-state').props.children).toBe('Loading');
    
    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(getByTestId('loading-state').props.children).toBe('Not Loading');
    });
    
    // User should be logged out initially
    expect(getByTestId('user-state').props.children).toBe('Logged Out');
    
    // Test sign in
    const mockSignIn = require('../app/lib/supabase').supabase.auth.signInWithPassword;
    mockSignIn.mockResolvedValueOnce({ error: null });
    
    await act(async () => {
      fireEvent.press(getByTestId('sign-in'));
    });
    
    expect(mockSignIn).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
    
    // Test sign up
    const mockSignUp = require('../app/lib/supabase').supabase.auth.signUp;
    mockSignUp.mockResolvedValueOnce({ error: null });
    
    await act(async () => {
      fireEvent.press(getByTestId('sign-up'));
    });
    
    expect(mockSignUp).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
    
    // Test sign out
    const mockSignOut = require('../app/lib/supabase').supabase.auth.signOut;
    mockSignOut.mockResolvedValueOnce({ error: null });
    
    await act(async () => {
      fireEvent.press(getByTestId('sign-out'));
    });
    
    expect(mockSignOut).toHaveBeenCalled();
    
    // Test Google sign in
    const mockGoogleSignIn = require('../app/lib/supabase').supabase.auth.signInWithOAuth;
    mockGoogleSignIn.mockResolvedValueOnce({ error: null });
    
    await act(async () => {
      fireEvent.press(getByTestId('google-sign-in'));
    });
    
    expect(mockGoogleSignIn).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'yourapp://auth/callback',
      },
    });
  });
});