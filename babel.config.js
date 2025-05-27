module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      ['module-resolver', {
        alias: {
          '@react-native-async-storage/async-storage': './node_modules/@react-native-async-storage/async-storage'
        }
      }]
    ]
  };
};