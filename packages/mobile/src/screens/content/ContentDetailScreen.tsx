import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const ContentDetailScreen = ({ route, navigation }: any) => {
  // Mock content — in production, fetch by route.params.id
  const content = {
    id: route?.params?.id || '1',
    title: 'Morning Masala Chai',
    caption: 'Start your day with the warmth of authentic masala chai ☕✨\n\nMade with love, fresh spices, and a century-old family recipe.\n\nCome try the best chai in town!',
    hashtags: ['#chai', '#masalachai', '#tealovers', '#mumbaifood', '#chailover'],
    status: 'draft',
    content_type: 'image',
    engagement: { likes: 0, comments: 0, saves: 0 },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <MaterialCommunityIcons name="image" size={64} color="#ccc" />
        <Text variant="bodyMedium" style={styles.imageText}>Generated Image Preview</Text>
      </View>

      <View style={styles.statusRow}>
        <Chip
          icon="circle"
          style={[styles.statusChip, content.status === 'published' ? styles.statusPublished : styles.statusDraft]}
          textStyle={styles.statusText}
        >
          {content.status.toUpperCase()}
        </Chip>
        <Text variant="bodySmall" style={styles.typeLabel}>{content.content_type.toUpperCase()}</Text>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Caption</Text>
      <Text variant="bodyMedium" style={styles.caption}>{content.caption}</Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>Hashtags</Text>
      <View style={styles.hashtagRow}>
        {content.hashtags.map((tag) => (
          <Chip key={tag} style={styles.hashtagChip} textStyle={styles.hashtagText}>{tag}</Chip>
        ))}
      </View>

      {content.status === 'published' && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <MaterialCommunityIcons name="heart" size={24} color={colors.error} />
              <Text variant="bodyLarge" style={styles.engagementNum}>{content.engagement.likes}</Text>
              <Text variant="bodySmall" style={styles.engagementLabel}>Likes</Text>
            </View>
            <View style={styles.engagementItem}>
              <MaterialCommunityIcons name="comment" size={24} color={colors.primary} />
              <Text variant="bodyLarge" style={styles.engagementNum}>{content.engagement.comments}</Text>
              <Text variant="bodySmall" style={styles.engagementLabel}>Comments</Text>
            </View>
            <View style={styles.engagementItem}>
              <MaterialCommunityIcons name="bookmark" size={24} color={colors.secondary} />
              <Text variant="bodyLarge" style={styles.engagementNum}>{content.engagement.saves}</Text>
              <Text variant="bodySmall" style={styles.engagementLabel}>Saves</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.actionRow}>
        <Button mode="outlined" icon="pencil" style={styles.actionBtn} onPress={() => {}}>
          Edit
        </Button>
        <Button mode="contained" icon="calendar" style={styles.actionBtn} onPress={() => navigation.navigate('SchedulePost', { contentId: content.id })}>
          Schedule
        </Button>
        <Button mode="contained-tonal" icon="share" style={styles.actionBtn} onPress={() => {}}>
          Share
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  imagePlaceholder: { height: 350, backgroundColor: '#f5f5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  imageText: { color: '#aaa', marginTop: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  statusChip: { backgroundColor: '#e0e0e0' },
  statusPublished: { backgroundColor: '#c8e6c9' },
  statusDraft: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  typeLabel: { color: colors.textSecondary },
  divider: { marginVertical: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  caption: { color: colors.text, lineHeight: 22 },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hashtagChip: { backgroundColor: '#f0e6d6' },
  hashtagText: { color: colors.primary, fontSize: 12 },
  engagementRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm },
  engagementItem: { alignItems: 'center' },
  engagementNum: { fontWeight: 'bold', marginTop: spacing.xs },
  engagementLabel: { color: colors.textSecondary },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.xl },
  actionBtn: { flex: 1, marginHorizontal: spacing.xs },
});
