import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AISuggestionCardProps {
  suggestion: string;
  type?: 'content' | 'hashtag' | 'schedule' | 'review';
  onCreateNow: () => void;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  type = 'content',
  onCreateNow,
}) => {
  const icons = {
    content: 'lightbulb-on',
    hashtag: 'pound',
    schedule: 'clock-outline',
    review: 'star-shooting',
  };

  const titles = {
    content: 'Content Idea',
    hashtag: 'Trending Hashtag',
    schedule: 'Best Time to Post',
    review: 'Review Response',
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icons[type]}
            size={20}
            color={colors.secondary}
          />
        </View>
        <Text style={styles.title}>{titles[type]}</Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>
      <Text style={styles.suggestion}>{suggestion}</Text>
      <Button
        title="Create Now"
        onPress={onCreateNow}
        variant="primary"
        size="small"
        style={styles.button}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.primary + '08',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  aiBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    ...typography.overline,
    color: colors.text,
    fontSize: 9,
  },
  suggestion: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.base,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
