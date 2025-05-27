import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const tw = useTailwind();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        'Registration Successful',
        'Please check your email for verification instructions.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw('flex-1 p-6 justify-center')}>
      <Text style={tw('text-3xl font-bold mb-6 text-center')}>Create Account</Text>
      
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
      
      <View style={tw('mb-4')}>
        <Text style={tw('text-sm font-medium mb-1')}>Password</Text>
        <TextInput
          style={tw('p-3 border border-gray-300 rounded-md')}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <View style={tw('mb-6')}>
        <Text style={tw('text-sm font-medium mb-1')}>Confirm Password</Text>
        <TextInput
          style={tw('p-3 border border-gray-300 rounded-md')}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity
        style={tw('bg-blue-600 p-4 rounded-md mb-4')}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={tw('text-white text-center font-bold')}>Sign Up</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={tw('text-center text-blue-600')}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}