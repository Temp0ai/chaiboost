import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ConnectPlatforms'>;
};

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  connected: boolean;
}

export const ConnectPlatformsScreen: React.FC<Props> = ({ navigation }) => {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      color: colors.instagram,
      description: 'Share photos, reels, and stories',
      connected: false,
    },
    {
      id: 'gmb',
      name: 'Google My Business',
      icon: 'google',
      color: colors.google,
      description: 'Manage your Google listing',
      connected: false,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: 'whatsapp',
      color: colors.whatsapp,
      description: 'Connect with customers directly',
      connected: false,
    },
  ]);

  const handleConnect = (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, connected: !p.connected } : p
      )
    );
  };

  const handleContinue = () => {
    const connectedCount = platforms.filter((p) => p.connected).length;
    if (connectedCount === 0) {
      Alert.alert(
        'Connect Platforms',
        'We recommend connecting at least one platform to get started.',
        [
          { text: 'Skip', onPress: () => navigation.navigate('BrandSetup') },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }
    navigation.navigate('BrandSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Connect Platforms" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Connect Your Accounts</Text>
          <Text style={styles.subtitle}>
            Link your social media accounts to manage everything from one place
          </Text>
        </View>

        <View style={styles.platformList}>
          {platforms.map((platform) => (
            <Card
              key={platform.id}
              style={styles.platformCard}
              variant="outlined"
            >
              <View style={styles.platformContent}>
                <View
                  style={[
                    styles.platformIcon,
                    { backgroundColor: platform.color + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={platform.icon}
                    size={28}
                    color={platform.color}
                  />
                </View>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformDescription}>
                    {platform.description}
                  </Text>
                </View>
                <Button
                  title={platform.connected ? 'Connected' : 'Connect'}
                  onPress={() => handleConnect(platform.id)}
                  variant={platform.connected ? 'outline' : 'primary'}
                  size="small"
                  style={{
                    backgroundColor: platform.connected
                      ? colors.successLight
                      : undefined,
                  }}
                  textStyle={{
                    color: platform.connected ? colors.success : undefined,
                  }}
                />
              </View>
              {platform.connected && (
                <View style={styles.connectedBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            You can connect more platforms later from Settings
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={styles.continueButton}
        />
        <Button
          title="Skip for now"
          onPress={() => navigation.navigate('BrandSetup')}
          variant="ghost"
          size="medium"
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
  platformList: {
    gap: spacing.md,
  },
  platformCard: {
    marginBottom: 0,
  },
  platformContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  platformIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  platformDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  connectedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '08',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  continueButton: {
    width: '100%',
  },
});
