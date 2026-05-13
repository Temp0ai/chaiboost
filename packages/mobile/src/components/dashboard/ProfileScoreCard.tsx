import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressIndicator } from '../common/ProgressIndicator';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ProfileScoreCardProps {
  score: number;
  label?: string;
}

export const ProfileScoreCard: React.FC<ProfileScoreCardProps> = ({
  score,
  label = 'Profile Score',
}) => {
  const getScoreMessage = () => {
    if (score >= 90) return 'Excellent! Your profile is optimized.';
    if (score >= 70) return 'Good job! A few tweaks to improve.';
    if (score >= 50) return 'Getting there. Follow the suggestions.';
    return 'Needs work. Check the action items.';
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <ProgressIndicator
          value={score}
          size={100}
          strokeWidth={10}
          label={label}
        />
        <View style={styles.info}>
          <Text style={styles.title}>Profile Health</Text>
          <Text style={styles.message}>{getScoreMessage()}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});
