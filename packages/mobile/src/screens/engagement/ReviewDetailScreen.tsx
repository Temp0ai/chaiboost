import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const ReviewDetailScreen = ({ route }: any) => {
  // In production, fetch by route.params.reviewId
  const review = {
    id: route?.params?.reviewId || '1',
    name: 'Vikram P.',
    rating: 2,
    text: 'Chai was cold when served. Expected better for the price. Staff seemed uninterested.',
    sentiment: 'negative',
    date: '2 weeks ago',
    themes: ['service', 'temperature', 'value'],
    aiResponse: "Dear Vikram, we're truly sorry about your experience. Serving chai at the right temperature is something we take seriously, and we clearly fell short. We'd love to make it right — please visit us again and ask for Arjun. Your next chai is on us. 🙏",
  };

  const [response, setResponse] = useState(review.aiResponse);
  const [isEditing, setIsEditing] = useState(false);

  const renderStars = (rating: number) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={24}
          color={i <= rating ? '#FFD700' : '#ccc'}
        />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.reviewCard}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{review.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text variant="titleMedium" style={styles.name}>{review.name}</Text>
            <Text variant="bodySmall" style={styles.date}>{review.date}</Text>
          </View>
        </View>
        {renderStars(review.rating)}
        <Text variant="bodyLarge" style={styles.reviewText}>{review.text}</Text>
        <View style={styles.themeRow}>
          {review.themes.map((t) => (
            <Chip key={t} compact style={styles.themeChip} textStyle={styles.themeText}>#{t}</Chip>
          ))}
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.responseSection}>
        <View style={styles.responseHeader}>
          <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
          <Text variant="titleMedium" style={styles.responseTitle}>AI-Generated Response</Text>
          <Chip compact style={styles.sentimentChip}>😟 Empathetic</Chip>
        </View>
        <TextInput
          mode="outlined"
          value={response}
          onChangeText={setResponse}
          multiline
          numberOfLines={5}
          editable={isEditing}
          style={[styles.responseInput, !isEditing && styles.readOnlyInput]}
        />
        <View style={styles.responseActions}>
          <Button mode="outlined" onPress={() => setIsEditing(!isEditing)} style={styles.actionBtn} icon="pencil">
            {isEditing ? 'Lock' : 'Edit'}
          </Button>
          <Button mode="outlined" onPress={() => setResponse(review.aiResponse)} style={styles.actionBtn} icon="refresh">
            Regenerate
          </Button>
          <Button mode="contained" onPress={() => {}} style={styles.actionBtn} icon="send">
            Send Reply
          </Button>
        </View>
      </View>

      <View style={styles.warningBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color={colors.accent} />
        <Text variant="bodySmall" style={styles.warningText}>
          For negative reviews, the response will be queued for your review before posting. It won't be published automatically.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  headerInfo: { marginLeft: spacing.md },
  name: { fontWeight: 'bold', color: colors.text },
  date: { color: colors.textSecondary },
  starRow: { flexDirection: 'row', marginBottom: spacing.md },
  reviewText: { color: colors.text, lineHeight: 24, marginBottom: spacing.md },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeChip: { backgroundColor: '#f0e6d6' },
  themeText: { color: colors.primary, fontSize: 12 },
  divider: { marginVertical: spacing.lg },
  responseSection: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  responseTitle: { flex: 1, fontWeight: '600', color: colors.text },
  sentimentChip: { backgroundColor: '#e3f2fd' },
  responseInput: { backgroundColor: '#fff', marginBottom: spacing.md },
  readOnlyInput: { backgroundColor: '#f9f9f9' },
  responseActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, marginHorizontal: spacing.xs },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff8e1', padding: spacing.md, borderRadius: 8, marginTop: spacing.lg, marginBottom: spacing.xl },
  warningText: { marginLeft: spacing.sm, color: colors.textSecondary, flex: 1, lineHeight: 18 },
});
