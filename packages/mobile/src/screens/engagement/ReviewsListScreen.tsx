import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const sampleReviews = [
  { id: '1', name: 'Priya S.', rating: 5, text: 'Best masala chai in Mumbai! The cardamom flavor is perfect. Will definitely come back.', sentiment: 'positive', date: '2 days ago', responded: true },
  { id: '2', name: 'Rahul M.', rating: 4, text: 'Great chai, but the wait time was a bit long during peak hours. Otherwise fantastic!', sentiment: 'positive', date: '5 days ago', responded: false },
  { id: '3', name: 'Anita K.', rating: 5, text: 'Love the kulhad chai here. Authentic taste that reminds me of my grandmother\'s recipe.', sentiment: 'positive', date: '1 week ago', responded: true },
  { id: '4', name: 'Vikram P.', rating: 2, text: 'Chai was cold when served. Expected better for the price. Staff seemed uninterested.', sentiment: 'negative', date: '2 weeks ago', responded: false },
  { id: '5', name: 'Meera D.', rating: 4, text: 'Nice ambiance and good variety of teas. The ginger chai is my favorite.', sentiment: 'positive', date: '3 weeks ago', responded: true },
];

export const ReviewsListScreen = ({ navigation }: any) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = sampleReviews.filter((r) => {
    if (filter === 'positive' && r.rating < 4) return false;
    if (filter === 'negative' && r.rating > 2) return false;
    if (filter === 'unanswered' && r.responded) return false;
    if (search && !r.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const renderStars = (rating: number) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : '#ccc'}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: typeof sampleReviews[0] }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ReviewDetail', { reviewId: item.id })}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text variant="titleSmall" style={styles.name}>{item.name}</Text>
              <Text variant="bodySmall" style={styles.date}>{item.date}</Text>
            </View>
            {renderStars(item.rating)}
          </View>
          <Text variant="bodyMedium" style={styles.reviewText} numberOfLines={2}>{item.text}</Text>
          <View style={styles.footerRow}>
            <Chip
              compact
              style={[styles.sentimentChip, item.sentiment === 'positive' ? styles.positiveChip : styles.negativeChip]}
              textStyle={styles.sentimentText}
            >
              {item.sentiment === 'positive' ? '😊 Positive' : '😟 Negative'}
            </Chip>
            {item.responded ? (
              <Chip compact style={styles.respondedChip} textStyle={styles.respondedText}>✓ Replied</Chip>
            ) : (
              <Chip compact style={styles.pendingChip} textStyle={styles.pendingText}>⏳ Needs Reply</Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search reviews..." value={search} onChangeText={setSearch} style={styles.searchBar} />
      <View style={styles.chipRow}>
        {['all', 'positive', 'negative', 'unanswered'].map((f) => (
          <Chip key={f} selected={filter === f} onPress={() => setFilter(f)} style={styles.filterChip}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>
      <View style={styles.summaryRow}>
        <Text variant="bodyMedium" style={styles.summaryText}>
          ⭐ 4.2 average · {sampleReviews.length} reviews · {sampleReviews.filter(r => !r.responded).length} unanswered
        </Text>
      </View>
      <FlatList
        data={filtered}
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
  searchBar: { margin: spacing.md, backgroundColor: '#fff' },
  chipRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  filterChip: { marginRight: spacing.sm },
  summaryRow: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  summaryText: { color: colors.textSecondary },
  list: { padding: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerInfo: { flex: 1, marginLeft: spacing.sm },
  name: { fontWeight: '600', color: colors.text },
  date: { color: colors.textSecondary },
  starRow: { flexDirection: 'row' },
  reviewText: { color: colors.text, lineHeight: 20, marginBottom: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  sentimentChip: { backgroundColor: '#e8f5e9' },
  positiveChip: { backgroundColor: '#e8f5e9' },
  negativeChip: { backgroundColor: '#ffebee' },
  sentimentText: { fontSize: 11 },
  respondedChip: { backgroundColor: '#e3f2fd' },
  respondedText: { fontSize: 11, color: '#1976d2' },
  pendingChip: { backgroundColor: '#fff3e0' },
  pendingText: { fontSize: 11, color: '#e65100' },
});
