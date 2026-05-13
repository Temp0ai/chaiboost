import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  save: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(`@chaiboost:${key}`, jsonValue);
    } catch (error) {
      console.error('Storage save error:', error);
    }
  },

  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(`@chaiboost:${key}`);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`@chaiboost:${key}`);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chaiboostKeys = keys.filter((key) => key.startsWith('@chaiboost:'));
      await AsyncStorage.multiRemove(chaiboostKeys);
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};
