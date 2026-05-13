import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const posts = [
  { id: '1', title: 'Monsoon Chai Reel', type: 'reel', likes: 89, comments: 12, saves: 34, shares: 8, reach: 2100, engagement: 6.8, date: 'May 10' },
  { id: '2', title: 'Masala Chai Recipe', type: 'carousel', likes: 67, comments: 8, saves: 56, shares: 15, reach: 1800, engagement: 8.1, date: 'May 8' },
  { id: '3', title: 'Behind the Scenes', type: 'reel', likes: 45, comments: 5, saves: 12, shares: 3, reach: 950, engagement: 6.8, date: 'May 5' },
  { id: '4', title: 'Weekend Special Offer', type: 'image', likes: 34, comments: 3, saves: 8, shares: 2, reach: 650, engagement: 7.2, date: 'May 3' },
  { id: '5', title: 'Tea Fact Monday', type: 'carousel', likes: 28, comments: 6, saves: 22, shares: 5, reach: 520, engagement: 11.7, date: 'May 1' },
];

export const PostPerformanceScreen = () => {
  const getEngagementColor = (rate: number) => {
    if (rate >= 8) return colors.success;
    if (rate >= 5) return colors.accent;
    return colors.textSecondary;
  };

  const renderItem = ({ item, index }: { item: typeof posts[0]; index: number }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.titleSection}>
            <Text variant="titleMedium" style={styles.postTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Chip compact style={styles.typeChip}>
                {item.type === 'reel' ? '🎬 Reel' : item.type === 'carousel' ? '📋 Carousel' : '🖼️ Image'}
              </Chip>
              <Text variant="bodySmall" style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
          <View style={styles.engagementBadge}>
            <Text variant="titleLarge" style={[styles.engagementValue, { color: getEngagementColor(item.engagement) }]}>
              {item.engagement}%
            </Text>
            <Text variant="bodySmall" style={styles.engagementLabel}>eng.</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="heart" size={18} color={colors.error} />
            <Text variant="bodyMedium" style={styles.statValue}>{item.likes}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment" size={18} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.statValue}>{item.comments}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Comments</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bookmark" size={18} color={colors.secondary} />
            <Text variant="bodyMedium" style={styles.statValue}>{item.saves}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Saves</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="share" size={18} color={colors.accent} />
            <Text variant="bodyMedium" style={styles.statValue}>{item.shares}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Shares</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="eye" size={18} color={colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.statValue}>{item.reach}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Reach</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.heading}>Post Performance</Text>
        <Chip compact style={styles.sortChip}>Sorted by reach</Chip>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  heading: { fontWeight: 'bold', color: colors.text },
  sortChip: { backgroundColor: '#f0e6d6' },
  list: { padding: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  rankText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  titleSection: { flex: 1 },
  postTitle: { fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  typeChip: { backgroundColor: '#f5f0ea' },
  dateText: { color: colors.textSecondary },
  engagementBadge: { alignItems: 'center' },
  engagementValue: { fontWeight: 'bold' },
  engagementLabel: { color: colors.textSecondary, fontSize: 10 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: '600', marginTop: spacing.xs },
  statLabel: { color: colors.textSecondary, fontSize: 11 },
});
