import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface RecentContentItem {
  id: string;
  thumbnailUrl: string;
  type: 'image' | 'video';
  status: 'draft' | 'scheduled' | 'published';
}

interface RecentContentProps {
  items: RecentContentItem[];
  onItemPress: (item: RecentContentItem) => void;
  onViewAll: () => void;
}

export const RecentContent: React.FC<RecentContentProps> = ({
  items,
  onItemPress,
  onViewAll,
}) => {
  const statusColors = {
    draft: colors.textSecondary,
    scheduled: colors.warning,
    published: colors.success,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Content</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onItemPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            {item.type === 'video' && (
              <View style={styles.playIcon}>
                <MaterialCommunityIcons name="play" size={16} color={colors.white} />
              </View>
            )}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColors[item.status] },
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  viewAll: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  item: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
