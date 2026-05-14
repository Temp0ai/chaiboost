import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip, TextInput, ProgressBar } from 'react-native-paper';
import { useContentStore } from '../../stores/contentStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const musicMoods = [
  { value: 'energetic', label: '🔥 Energetic' },
  { value: 'calm', label: '🍃 Calm' },
  { value: 'festive', label: '🎊 Festive' },
  { value: 'trending', label: '📈 Trending' },
];

export const VideoGeneratorScreen = ({ navigation }: any) => {
  const { generateVideo, isGenerating, generationProgress } = useContentStore();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [mood, setMood] = useState('energetic');
  const [description, setDescription] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const id = await generateVideo({
        photos: selectedPhotos,
        musicMood: mood,
        scenes: [],
      });
      setGeneratedUrl(`video/${id}`);
    } catch (err) {
      console.error('Video generation failed:', err);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="titleLarge" style={styles.heading}>Create Video</Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Select photos and AI will create a professional 1-minute promotional video
      </Text>

      <Text variant="labelLarge" style={styles.label}>Select Photos & Clips</Text>
      <View style={styles.photoGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>📷</Text>
          </View>
        ))}
      </View>
      <Button mode="outlined" icon="image-plus" style={styles.uploadBtn}>
        Upload from Gallery
      </Button>

      <Text variant="labelLarge" style={styles.label}>Video Description</Text>
      <TextInput
        mode="outlined"
        placeholder="e.g., Morning chai routine, fresh ingredients, cozy vibes..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>Music Mood</Text>
      <View style={styles.chipRow}>
        {musicMoods.map((m) => (
          <Chip
            key={m.value}
            selected={mood === m.value}
            onPress={() => setMood(m.value)}
            style={styles.chip}
          >
            {m.label}
          </Chip>
        ))}
      </View>

      {isGenerating && (
        <View style={styles.progressSection}>
          <Text variant="bodyMedium">🎬 Rendering video... {generationProgress}%</Text>
          <ProgressBar progress={generationProgress / 100} color={colors.primary} style={styles.progressBar} />
          <Text variant="bodySmall" style={styles.progressHint}>This may take 1-2 minutes</Text>
        </View>
      )}

      {generatedUrl && !isGenerating && (
        <View style={styles.previewSection}>
          <View style={styles.videoPreview}>
            <Text variant="bodyLarge" style={styles.previewIcon}>🎬</Text>
            <Text variant="bodyMedium">Video ready!</Text>
          </View>
          <View style={styles.actionRow}>
            <Button mode="outlined" onPress={handleGenerate} style={styles.actionBtn}>🔄 Remake</Button>
            <Button mode="contained" onPress={() => navigation.navigate('SchedulePost', { contentId: 'new' })} style={styles.actionBtn}>📤 Post It</Button>
          </View>
        </View>
      )}

      {!isGenerating && !generatedUrl && (
        <Button
          mode="contained"
          onPress={handleGenerate}
          disabled={selectedPhotos.length < 2 && !description.trim()}
          style={styles.generateBtn}
          icon="video"
        >
          🎬 Generate Video
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  heading: { color: colors.text, fontWeight: 'bold' },
  subheading: { color: colors.textSecondary, marginBottom: spacing.lg },
  label: { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoPlaceholder: { width: 100, height: 100, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  photoText: { fontSize: 28 },
  uploadBtn: { marginTop: spacing.sm },
  input: { marginBottom: spacing.sm, backgroundColor: '#fff' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { marginRight: spacing.sm },
  progressSection: { marginTop: spacing.xl, alignItems: 'center' },
  progressBar: { width: '100%', marginTop: spacing.sm, height: 6, borderRadius: 3 },
  progressHint: { color: colors.textSecondary, marginTop: spacing.sm },
  previewSection: { marginTop: spacing.lg },
  videoPreview: { height: 250, backgroundColor: '#1a1a1a', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewIcon: { fontSize: 48, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md },
  actionBtn: { flex: 1, marginHorizontal: spacing.sm },
  generateBtn: { marginTop: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.primary },
});
