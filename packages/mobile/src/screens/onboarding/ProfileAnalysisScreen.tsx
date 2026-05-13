import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { ProgressIndicator } from '../../components/common/ProgressIndicator';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ProfileAnalysis'>;
};

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export const ProfileAnalysisScreen: React.FC<Props> = ({ navigation }) => {
  const score = 65;

  const actionItems: ActionItem[] = [
    {
      id: '1',
      title: 'Add profile photo',
      description: 'Profiles with photos get 10x more engagement',
      icon: 'camera',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Write a compelling bio',
      description: 'Tell customers what makes your chai special',
      icon: 'text',
      priority: 'high',
      completed: false,
    },
    {
      id: '3',
      title: 'Add business hours',
      description: 'Help customers know when you\'re open',
      icon: 'clock-outline',
      priority: 'medium',
      completed: false,
    },
    {
      id: '4',
      title: 'Connect Instagram',
      description: 'Share your chai moments with the world',
      icon: 'instagram',
      priority: 'medium',
      completed: true,
    },
    {
      id: '5',
      title: 'Get 5 reviews',
      description: 'Build trust with customer reviews',
      icon: 'star',
      priority: 'low',
      completed: false,
    },
  ];

  const completedCount = actionItems.filter((item) => item.completed).length;

  const priorityColors = {
    high: colors.error,
    medium: colors.warning,
    low: colors.success,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile Analysis" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scoreSection}>
          <ProgressIndicator
            value={score}
            size={140}
            strokeWidth={12}
            label="Profile Score"
          />
          <Text style={styles.scoreMessage}>
            Good start! Complete the actions below to improve your score.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="filled">
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statCard} variant="filled">
            <Text style={styles.statValue}>{actionItems.length - completedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </Card>
          <Card style={styles.statCard} variant="filled">
            <Text style={styles.statValue}>{score}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {actionItems.map((item) => (
            <Card key={item.id} style={styles.actionCard} variant="outlined">
              <View style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: item.completed
                        ? colors.successLight
                        : priorityColors[item.priority] + '15',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.completed ? 'check' : item.icon}
                    size={20}
                    color={
                      item.completed ? colors.success : priorityColors[item.priority]
                    }
                  />
                </View>
                <View style={styles.actionInfo}>
                  <Text
                    style={[
                      styles.actionTitle,
                      item.completed && styles.actionTitleCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {item.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priorityColors[item.priority] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: priorityColors[item.priority] },
                    ]}
                  >
                    {item.priority}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to First Post"
          onPress={() => navigation.navigate('FirstPostWizard')}
          variant="primary"
          size="large"
          style={styles.continueButton}
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
  scoreSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  scoreMessage: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.base,
    maxWidth: 280,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  actionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  actionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
  },
  continueButton: {
    width: '100%',
  },
});
