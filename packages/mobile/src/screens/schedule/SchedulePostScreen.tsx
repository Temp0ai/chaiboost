import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip, TextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const SchedulePostScreen = ({ route, navigation }: any) => {
  const [platform, setPlatform] = useState('instagram');
  const [date, setDate] = useState('May 15, 2026');
  const [time, setTime] = useState('8:00 AM');
  const [caption, setCaption] = useState('Start your day with the warmth of authentic masala chai ☕✨');

  const handleSchedule = () => {
    // TODO: call schedule API
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="titleLarge" style={styles.heading}>Schedule Post</Text>

      <Text variant="labelLarge" style={styles.label}>Preview</Text>
      <View style={styles.previewCard}>
        <View style={styles.previewImage}>
          <MaterialCommunityIcons name="image" size={48} color="#ccc" />
        </View>
        <Text variant="bodyMedium" style={styles.previewCaption} numberOfLines={3}>{caption}</Text>
      </View>

      <Divider style={styles.divider} />

      <Text variant="labelLarge" style={styles.label}>Platform</Text>
      <View style={styles.chipRow}>
        <Chip
          selected={platform === 'instagram'}
          onPress={() => setPlatform('instagram')}
          style={styles.chip}
          icon="instagram"
        >
          Instagram
        </Chip>
        <Chip
          selected={platform === 'google_my_business'}
          onPress={() => setPlatform('google_my_business')}
          style={styles.chip}
          icon="google"
        >
          Google My Business
        </Chip>
      </View>

      <Text variant="labelLarge" style={styles.label}>Caption</Text>
      <TextInput
        mode="outlined"
        value={caption}
        onChangeText={setCaption}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>Date & Time</Text>
      <View style={styles.dateTimeRow}>
        <TextInput
          mode="outlined"
          label="Date"
          value={date}
          onChangeText={setDate}
          style={[styles.input, styles.halfInput]}
          left={<TextInput.Icon icon="calendar" />}
        />
        <TextInput
          mode="outlined"
          label="Time"
          value={time}
          onChangeText={setTime}
          style={[styles.input, styles.halfInput]}
          left={<TextInput.Icon icon="clock" />}
        />
      </View>

      <View style={styles.tipBox}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.accent} />
        <Text variant="bodySmall" style={styles.tipText}>
          AI suggests posting at 8:00 AM for best engagement with chai lovers
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.btn}>Cancel</Button>
        <Button mode="contained" onPress={handleSchedule} style={styles.btn} icon="calendar-check">
          Schedule
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  heading: { color: colors.text, fontWeight: 'bold', marginBottom: spacing.lg },
  label: { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  previewCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.md },
  previewImage: { height: 200, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  previewCaption: { marginTop: spacing.sm, color: colors.text },
  divider: { marginVertical: spacing.md },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { marginRight: spacing.sm },
  input: { marginBottom: spacing.sm, backgroundColor: '#fff' },
  dateTimeRow: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1 },
  tipBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8e1', padding: spacing.md, borderRadius: 8, marginTop: spacing.sm },
  tipText: { marginLeft: spacing.sm, color: colors.textSecondary, flex: 1 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.xl },
  btn: { flex: 1, marginHorizontal: spacing.sm },
});
