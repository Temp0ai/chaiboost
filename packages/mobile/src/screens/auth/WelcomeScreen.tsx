import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthStack';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>☕</Text>
          </View>
          <Text style={styles.appName}>ChaiBoost</Text>
          <Text style={styles.tagline}>
            AI-Powered Marketing for Your Chai Business
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureText}>AI-Generated Content</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Smart Scheduling</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>Review Management</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Analytics & Insights</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
            size="large"
            style={styles.getStartedButton}
            textStyle={styles.getStartedText}
          />
          <Button
            title="I already have an account"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            size="large"
            style={styles.loginButton}
            textStyle={styles.loginText}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['2xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body1,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 280,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: spacing.xl,
  },
  getStartedButton: {
    marginBottom: spacing.md,
    backgroundColor: colors.secondary,
  },
  getStartedText: {
    color: colors.text,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: 'transparent',
  },
  loginText: {
    color: 'rgba(255,255,255,0.8)',
  },
});
