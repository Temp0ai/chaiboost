import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Card, Chip, Searchbar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const trendingHashtags = [
  { tag: '#monsoonchai', score: 92, direction: 'rising', posts: '245K' },
  { tag: '#icedchai', score: 85, direction: 'rising', posts: '189K' },
  { tag: '#chailatte', score: 78, direction: 'stable', posts: '312K' },
  { tag: '#veganchai', score: 72, direction: 'rising', posts: '98K' },
  { tag: '#chairecipe', score: 68, direction: 'stable', posts: '567K' },
  { tag: '#teatime', score: 65, direction: 'stable', posts: '1.2M' },
  { tag: '#chaiandchat', score: 60, direction: 'rising', posts: '45K' },
  { tag: '#spicedchai', score: 58, direction: 'stable', posts: '156K' },
];

const contentIdeas = [
  { id: '1', type: 'reel', title: '5 Chai Varieties in 60 Seconds', hook: 'POV: You can\'t decide which chai to try first', trend: '#monsoonchai', effort: 'medium' },
  { id: '2', type: 'carousel', title: 'The Perfect Masala Chai Recipe', hook: 'Save this for later ☕', trend: '#chairecipe', effort: 'low' },
  { id: '3', type: 'reel', title: 'Behind the Scenes: Making Kulhad Chai', hook: 'This is how we make 500 cups a day', trend: '#kulhadchai', effort: 'low' },
  { id: '4', type: 'story', title: 'Chai of the Day Poll', hook: 'Which one would you pick?', trend: '#chailover', effort: 'low' },
];

export const TrendsScreen = () => {
  const [search, setSearch] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Searchbar placeholder="Search hashtags..." value={search} onChangeText={setSearch} style={styles.searchBar} />

      <Text variant="titleMedium" style={styles.sectionTitle}>🔥 Trending Hashtags</Text>
      <FlatList
        data={trendingHashtags}
        scrollEnabled={false}
        keyExtractor={(item) => item.tag}
        renderItem={({ item }) => (
          <View style={styles.hashtagRow}>
            <View style={styles.hashtagInfo}>
              <Text variant="bodyLarge" style={styles.hashtagName}>{item.tag}</Text>
              <Text variant="bodySmall" style={styles.hashtagPosts}>{item.posts} posts</Text>
            </View>
            <View style={styles.scoreSection}>
              <View style={[styles.scoreBar, { width: `${item.score}%` }]} />
              <Text variant="bodySmall" style={styles.scoreText}>{item.score}</Text>
            </View>
            <MaterialCommunityIcons
              name={item.direction === 'rising' ? 'trending-up' : 'trending-neutral'}
              size={20}
              color={item.direction === 'rising' ? colors.success : colors.textSecondary}
            />
          </View>
        )}
      />

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>💡 Content Ideas</Text>
      {contentIdeas.map((idea) => (
        <Card key={idea.id} style={styles.ideaCard} mode="elevated">
          <Card.Content>
            <View style={styles.ideaHeader}>
              <Chip compact style={styles.typeChip} textStyle={styles.typeText}>
                {idea.type === 'reel' ? '🎬 Reel' : idea.type === 'carousel' ? '📋 Carousel' : '📱 Story'}
              </Chip>
              <Chip compact style={styles.trendChip} textStyle={styles.trendText}>{idea.trend}</Chip>
              <Chip compact style={styles.effortChip}>{idea.effort}</Chip>
            </View>
            <Text variant="titleMedium" style={styles.ideaTitle}>{idea.title}</Text>
            <Text variant="bodyMedium" style={styles.ideaHook}>"{idea.hook}"</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  searchBar: { marginBottom: spacing.md, backgroundColor: '#fff' },
  sectionTitle: { fontWeight: 'bold', color: colors.text, marginBottom: spacing.md },
  hashtagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  hashtagInfo: { flex: 1 },
  hashtagName: { fontWeight: '600', color: colors.primary },
  hashtagPosts: { color: colors.textSecondary },
  scoreSection: { width: 80, marginRight: spacing.sm },
  scoreBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  scoreText: { color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  divider: { marginVertical: spacing.lg },
  ideaCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: spacing.md },
  ideaHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  typeChip: { backgroundColor: '#e3f2fd' },
  typeText: { fontSize: 11 },
  trendChip: { backgroundColor: '#e8f5e9' },
  trendText: { fontSize: 11, color: colors.success },
  effortChip: { backgroundColor: '#fff3e0' },
  ideaTitle: { fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  ideaHook: { color: colors.textSecondary, fontStyle: 'italic' },
});
