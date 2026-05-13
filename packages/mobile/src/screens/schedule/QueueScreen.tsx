import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { EmptyState } from '../../components/common/EmptyState';

const upcomingPosts = [
  { id: '1', title: 'Morning Masala Chai', platform: 'instagram', scheduledAt: 'May 15, 8:00 AM', type: 'image', status: 'pending' },
  { id: '2', title: 'Weekend Special Offer', platform: 'instagram', scheduledAt: 'May 17, 10:00 AM', type: 'image', status: 'pending' },
  { id: '3', title: 'Tea Fact Carousel', platform: 'instagram', scheduledAt: 'May 20, 6:00 PM', type: 'carousel', status: 'pending' },
  { id: '4', title: 'Chai Recipe Reel', platform: 'instagram', scheduledAt: 'May 22, 9:00 AM', type: 'reel', status: 'pending' },
];

export const QueueScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: { item: typeof upcomingPosts[0] }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={item.type === 'reel' ? 'video' : item.type === 'carousel' ? 'view-carousel' : 'image'}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Chip compact style={styles.platformChip} textStyle={styles.platformText}>
              {item.platform === 'instagram' ? '📸 Instagram' : '📍 GMB'}
            </Chip>
            <Text variant="bodySmall" style={styles.timeText}>{item.scheduledAt}</Text>
          </View>
        </View>
        <IconButton icon="close-circle-outline" size={20} iconColor="#ccc" onPress={() => {}} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.heading}>Upcoming Posts</Text>
        <Chip compact style={styles.countChip}>{upcomingPosts.length} scheduled</Chip>
      </View>
      {upcomingPosts.length === 0 ? (
        <EmptyState
          icon="calendar-blank"
          title="No posts in queue"
          message="Schedule content to keep your audience engaged"
          actionLabel="Create Content"
          onAction={() => navigation.navigate('Content')}
        />
      ) : (
        <FlatList
          data={upcomingPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  heading: { fontWeight: 'bold', color: colors.text },
  countChip: { backgroundColor: '#f0e6d6' },
  list: { padding: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, backgroundColor: '#f5f0ea', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  title: { fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  platformChip: { backgroundColor: '#f0e6d6', marginRight: spacing.sm },
  platformText: { fontSize: 11 },
  timeText: { color: colors.textSecondary },
});
