import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BrandSetup'>;
};

const PRESET_COLORS = [
  '#8B4513', '#D2691E', '#FFD700', '#FF6B35',
  '#2E8B57', '#4169E1', '#9370DB', '#DC143C',
  '#FF69B4', '#20B2AA', '#FFA500', '#708090',
];

export const BrandSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [brandName, setBrandName] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>(['#8B4513']);
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== color));
      }
    } else {
      if (selectedColors.length < 3) {
        setSelectedColors([...selectedColors, color]);
      } else {
        Alert.alert('Color Limit', 'You can select up to 3 brand colors.');
      }
    }
  };

  const handleSave = () => {
    if (!brandName.trim()) {
      Alert.alert('Brand Name', 'Please enter your brand name.');
      return;
    }
    navigation.navigate('ProfileAnalysis');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Brand Setup" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Set Up Your Brand</Text>
          <Text style={styles.subtitle}>
            Customize how your brand appears across all platforms
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Logo</Text>
          <TouchableOpacity
            style={styles.logoUpload}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {logoUri ? (
              <View style={styles.logoPreview}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.logoText}>Logo selected</Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={32}
                  color={colors.textLight}
                />
                <Text style={styles.logoText}>Upload Logo</Text>
                <Text style={styles.logoHint}>Tap to select from gallery</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your brand name"
            placeholderTextColor={colors.textLight}
            value={brandName}
            onChangeText={setBrandName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Colors (up to 3)</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColors.includes(color) && styles.colorSwatchSelected,
                ]}
                onPress={() => toggleColor(color)}
                activeOpacity={0.7}
              >
                {selectedColors.includes(color) && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={colors.white}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.selectedColors}>
            {selectedColors.map((color) => (
              <View
                key={color}
                style={[styles.selectedColorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Tell us about your chai business..."
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save & Continue"
          onPress={handleSave}
          variant="primary"
          size="large"
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  logoUpload: {
    height: 120,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  logoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  logoHint: {
    ...typography.caption,
    color: colors.textLight,
  },
  textInput: {
    ...typography.body1,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    height: 52,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: colors.text,
  },
  selectedColors: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  selectedColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  footer: {
    padding: spacing.lg,
  },
  saveButton: {
    width: '100%',
  },
});

import { Platform } from 'react-native';
