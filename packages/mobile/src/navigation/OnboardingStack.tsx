import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConnectPlatformsScreen } from '../screens/onboarding/ConnectPlatformsScreen';
import { BrandSetupScreen } from '../screens/onboarding/BrandSetupScreen';
import { ProfileAnalysisScreen } from '../screens/onboarding/ProfileAnalysisScreen';
import { FirstPostWizardScreen } from '../screens/onboarding/FirstPostWizardScreen';

export type OnboardingStackParamList = {
  ConnectPlatforms: undefined;
  BrandSetup: undefined;
  ProfileAnalysis: undefined;
  FirstPostWizard: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ConnectPlatforms" component={ConnectPlatformsScreen} />
      <Stack.Screen name="BrandSetup" component={BrandSetupScreen} />
      <Stack.Screen name="ProfileAnalysis" component={ProfileAnalysisScreen} />
      <Stack.Screen name="FirstPostWizard" component={FirstPostWizardScreen} />
    </Stack.Navigator>
  );
};
