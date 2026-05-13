import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const metrics = [
  { label: 'Followers', value: '1,247', delta: '+15', deltaColor: colors.success, icon: 'account-group' },
  { label: 'Reach', value: '8.5K', delta: '+12%', deltaColor: colors.success, icon: 'eye' },
  { label: 'Engagement', value: '4.2%', delta: '+0.3%', deltaColor: colors.success, icon: 'heart' },
  { label: 'Profile Views', value: '320', delta: '-5%', deltaColor: colors.error, icon: 'account-eye' },
];

const weeklyData = [
  { day: 'Mon', engagement: 3.8 },
  { day: 'Tue', engagement: 4.1 },
  { day: 'Wed', engagement: 5.2 },
  { day: 'Thu', engagement: 3.5 },
  { day: 'Fri', engagement: 4.8 },
  { day: 'Sat', engagement: 6.1 },
  { day: 'Sun', engagement: 5.5 },
];

const topPosts = [
  { id: '1', title: 'Monsoon Chai Reel', likes: 89, comments: 12, saves: 34, reach: 2100 },
  { id: '2', title: 'Masala Chai Recipe', likes: 67, comments: 8, saves: 56, reach: 1800 },
  { id: '3', title: 'Behind the Scenes', likes: 45, comments: 5, saves: 12, reach: 950 },
];

export const OverviewScreen = () => {
  const maxEngagement = Math.max(...weeklyData.map(d => d.engagement));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.periodRow}>
        {['7d', '30d', '90d'].map((p) => (
          <Chip key={p} compact style={styles.periodChip}>{p}</Chip>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <Card key={m.label} style={styles.metricCard} mode="elevated">
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name={m.icon as any} size={24} color={colors.primary} />
              <Text variant="headlineMedium" style={styles.metricValue}>{m.value}</Text>
              <Text variant="bodySmall" style={styles.metricLabel}>{m.label}</Text>
              <Text variant="bodySmall" style={[styles.metricDelta, { color: m.deltaColor }]}>{m.delta}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Engagement This Week</Text>
          <View style={styles.barChart}>
            {weeklyData.map((d) => (
              <View key={d.day} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${(d.engagement / maxEngagement) * 100}%` }]} />
                </View>
                <Text variant="bodySmall" style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Top Performing Posts</Text>
          {topPosts.map((post, i) => (
            <View key={post.id} style={styles.postRow}>
              <View style={styles.postRank}>
                <Text variant="titleMedium" style={styles.rankText}>{i + 1}</Text>
              </View>
              <View style={styles.postInfo}>
                <Text variant="bodyLarge" style={styles.postTitle}>{post.title}</Text>
                <View style={styles.postStats}>
                  <Text variant="bodySmall" style={styles.statText}>❤️ {post.likes}</Text>
                  <Text variant="bodySmall" style={styles.statText}>💬 {post.comments}</Text>
                  <Text variant="bodySmall" style={styles.statText}>🔖 {post.saves}</Text>
                  <Text variant="bodySmall" style={styles.statText}>👁️ {post.reach}</Text>
                </View>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>AI Insights</Text>
          <View style={styles.insightRow}>
            <MaterialCommunityIcons name="lightbulb" size={20} color={colors.accent} />
            <Text variant="bodyMedium" style={styles.insightText}>
              Your chai recipe posts get 3x more saves than promotional posts. Consider posting more recipes.
            </Text>
          </View>
          <View style={styles.insightRow}>
            <MaterialCommunityIcons name="clock" size={20} color={colors.accent} />
            <Text variant="bodyMedium" style={styles.insightText}>
              Posts at 8-9 AM on weekdays perform best for your audience.
            </Text>
          </View>
          <View style={styles.insightRow}>
            <MaterialCommunityIcons name="trending-up" size={20} color={colors.success} />
            <Text variant="bodyMedium" style={styles.insightText}>
              #monsoonchai is trending up 42% this week — great time to post!
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  periodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  periodChip: { marginRight: spacing.sm },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  metricCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12 },
  metricContent: { alignItems: 'center', paddingVertical: spacing.md },
  metricValue: { fontWeight: 'bold', color: colors.text, marginTop: spacing.xs },
  metricLabel: { color: colors.textSecondary },
  metricDelta: { fontWeight: '600', marginTop: spacing.xs },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: spacing.md },
  chartTitle: { fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barColumn: { alignItems: 'center', flex: 1 },
  barWrapper: { height: 100, justifyContent: 'flex-end', width: 20 },
  bar: { width: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  barLabel: { color: colors.textSecondary, marginTop: spacing.xs },
  postRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  postRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rankText: { color: '#fff', fontWeight: 'bold' },
  postInfo: { flex: 1 },
  postTitle: { fontWeight: '600', color: colors.text },
  postStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  statText: { color: colors.textSecondary },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  insightText: { marginLeft: spacing.sm, color: colors.text, flex: 1, lineHeight: 20 },
});
