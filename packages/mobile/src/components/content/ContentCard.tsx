import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ContentCardProps {
  thumbnailUrl: string;
  title: string;
  status: 'draft' | 'scheduled' | 'published';
  engagementCount?: number;
  type: 'image' | 'video' | 'carousel';
  onPress: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  thumbnailUrl,
  title,
  status,
  engagementCount,
  type,
  onPress,
}) => {
  const statusColors = {
    draft: colors.textSecondary,
    scheduled: colors.warning,
    published: colors.success,
  };

  const statusLabels = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    published: 'Published',
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.image} />
        {type === 'video' && (
          <View style={styles.playIcon}>
            <MaterialCommunityIcons name="play" size={20} color={colors.white} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
          <Text style={styles.statusText}>{statusLabels[status]}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {engagementCount !== undefined && (
          <View style={styles.engagement}>
            <MaterialCommunityIcons name="heart" size={14} color={colors.textSecondary} />
            <Text style={styles.engagementText}>{engagementCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
    width: '48%',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.overline,
    color: colors.white,
    fontSize: 9,
  },
  info: {
    padding: spacing.md,
  },
  title: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
