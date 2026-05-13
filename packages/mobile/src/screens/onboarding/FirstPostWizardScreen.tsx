import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'FirstPostWizard'>;
};

const STEPS = [
  { id: 1, title: 'Choose Type', icon: 'image' },
  { id: 2, title: 'Add Content', icon: 'pencil' },
  { id: 3, title: 'Write Caption', icon: 'text' },
  { id: 4, title: 'Review', icon: 'check-circle' },
];

const CONTENT_TYPES = [
  { id: 'photo', label: 'Photo Post', icon: 'camera', description: 'Share a chai moment' },
  { id: 'reel', label: 'Short Video', icon: 'video', description: 'Create a quick reel' },
  { id: 'story', label: 'Story', icon: 'cellphone', description: '24h disappearing content' },
  { id: 'carousel', label: 'Carousel', icon: 'view-carousel', description: 'Multiple images' },
];

export const FirstPostWizardScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');

  const handleNext = () => {
    if (currentStep === 1 && !selectedType) {
      Alert.alert('Select Type', 'Please choose a content type.');
      return;
    }
    if (currentStep === 2 && !prompt.trim()) {
      Alert.alert('Add Content', 'Please describe what you want to create.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        'Post Created! 🎉',
        'Your first post has been created. Welcome to ChaiBoost!',
        [{ text: 'Get Started', onPress: () => navigation.getParent()?.goBack() }]
      );
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <View
            style={[
              styles.stepDot,
              currentStep >= step.id && styles.stepDotActive,
            ]}
          >
            {currentStep > step.id ? (
              <MaterialCommunityIcons name="check" size={14} color={colors.white} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step.id && styles.stepNumberActive,
                ]}
              >
                {step.id}
              </Text>
            )}
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step.id && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of post?</Text>
      <Text style={styles.stepSubtitle}>
        Choose the format for your first post
      </Text>
      <View style={styles.typeGrid}>
        {CONTENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              selectedType === type.id && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={type.icon}
              size={32}
              color={selectedType === type.id ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.typeLabel,
                selectedType === type.id && styles.typeLabelSelected,
              ]}
            >
              {type.label}
            </Text>
            <Text style={styles.typeDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Describe your post</Text>
      <Text style={styles.stepSubtitle}>
        Tell our AI what you want to create
      </Text>
      <TextInput
        style={styles.textArea}
        placeholder="e.g., A warm cup of masala chai with steam rising, cozy cafe vibes..."
        placeholderTextColor={colors.textLight}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Quick ideas:</Text>
        {['Morning chai ritual', 'Chai and snacks pairing', 'Behind the scenes'].map(
          (suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => setPrompt(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Write your caption</Text>
      <Text style={styles.stepSubtitle}>
        Add a caption or let AI generate one
      </Text>
      <TextInput
        style={styles.textArea}
        placeholder="Write your caption here..."
        placeholderTextColor={colors.textLight}
        value={caption}
        onChangeText={setCaption}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Button
        title="✨ Generate with AI"
        onPress={() => setCaption('Starting the day right with a perfect cup of chai ☕✨ #ChaiLovers #MorningVibes #ChaiTime')}
        variant="outline"
        size="medium"
        style={styles.aiButton}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review your post</Text>
      <Text style={styles.stepSubtitle}>
        Make sure everything looks good
      </Text>
      <Card style={styles.previewCard} variant="outlined">
        <View style={styles.previewImage}>
          <MaterialCommunityIcons
            name="image"
            size={48}
            color={colors.textLight}
          />
          <Text style={styles.previewImageText}>AI-Generated Image</Text>
        </View>
        <View style={styles.previewInfo}>
          <Text style={styles.previewType}>
            {CONTENT_TYPES.find((t) => t.id === selectedType)?.label}
          </Text>
          <Text style={styles.previewCaption}>
            {caption || 'No caption added'}
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Create First Post" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepIndicator()}
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            size="large"
            style={styles.backButton}
          />
        )}
        <Button
          title={currentStep === 4 ? 'Create Post' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  typeCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  typeLabel: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  typeLabelSelected: {
    color: colors.primary,
  },
  typeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textArea: {
    ...typography.body1,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    minHeight: 120,
  },
  suggestions: {
    marginTop: spacing.base,
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  aiButton: {
    marginTop: spacing.base,
  },
  previewCard: {
    padding: 0,
  },
  previewImage: {
    height: 200,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewImageText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewInfo: {
    padding: spacing.base,
  },
  previewType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  previewCaption: {
    ...typography.body2,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
