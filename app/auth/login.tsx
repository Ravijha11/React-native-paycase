import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const tw = useTailwind();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // No need to navigate here as the auth state change will trigger navigation
    } catch (error: any) {
      Alert.alert('Google Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw('flex-1 p-6 justify-center')}>
      <Text style={tw('text-3xl font-bold mb-6 text-center')}>Welcome Back</Text>
      
      <View style={tw('mb-4')}>
        <Text style={tw('text-sm font-medium mb-1')}>Email</Text>
        <TextInput
          style={tw('p-3 border border-gray-300 rounded-md')}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      
      <View style={tw('mb-6')}>
        <Text style={tw('text-sm font-medium mb-1')}>Password</Text>
        <TextInput
          style={tw('p-3 border border-gray-300 rounded-md')}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity
        style={tw('bg-blue-600 p-4 rounded-md mb-4')}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={tw('text-white text-center font-bold')}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={tw('bg-white p-4 rounded-md border border-gray-300 mb-4')}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        <Text style={tw('text-center font-bold')}>Sign In with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={tw('text-center text-blue-600')}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}