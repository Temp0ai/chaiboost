import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, Switch, SegmentedButtons, HelperText } from 'react-native-paper';
import { useContentStore } from '../../stores/contentStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const styles_list = [
  { value: 'warm_rustic', label: '🌾 Rustic' },
  { value: 'modern_minimal', label: '✨ Modern' },
  { value: 'festive', label: '🎊 Festive' },
  { value: 'dark_premium', label: '🖤 Premium' },
];

export const ImageGeneratorScreen = ({ route, navigation }: any) => {
  const contentType = route?.params?.contentType || 'product_showcase';
  const { generateImage, isGenerating, generationProgress } = useContentStore();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('warm_rustic');
  const [useLogo, setUseLogo] = useState(true);
  const [textLine1, setTextLine1] = useState('');
  const [textLine2, setTextLine2] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const id = await generateImage({
        contentType,
        prompt: prompt,
        style,
        includeLogo: useLogo,
        textOverlay: textLine1 ? `${textLine1}\n${textLine2}` : undefined,
      });
      // Poll for result
      setGeneratedUrl(`content/${id}/preview`);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="titleLarge" style={styles.heading}>Generate AI Image</Text>

      <Text variant="labelLarge" style={styles.label}>Describe your image</Text>
      <TextInput
        mode="outlined"
        placeholder="e.g., Masala chai in a kulhad with cinnamon sticks..."
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>Style</Text>
      <SegmentedButtons
        value={style}
        onValueChange={setStyle}
        buttons={styles_list}
        style={styles.segmented}
      />

      <View style={styles.row}>
        <Text variant="bodyLarge">Include my logo</Text>
        <Switch value={useLogo} onValueChange={setUseLogo} color={colors.primary} />
      </View>

      <Text variant="labelLarge" style={styles.label}>Text Overlay (optional)</Text>
      <TextInput
        mode="outlined"
        placeholder="Headline (e.g., Best Chai in Town)"
        value={textLine1}
        onChangeText={setTextLine1}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Subtext (e.g., ₹20 only)"
        value={textLine2}
        onChangeText={setTextLine2}
        style={styles.input}
      />

      {isGenerating && (
        <View style={styles.progressContainer}>
          <Text variant="bodyMedium">Generating... {generationProgress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${generationProgress}%` }]} />
          </View>
        </View>
      )}

      {generatedUrl && !isGenerating && (
        <View style={styles.preview}>
          <Text variant="labelLarge" style={styles.label}>Preview</Text>
          <View style={styles.previewBox}>
            <Text variant="bodyMedium" style={styles.previewText}>✅ Image generated successfully!</Text>
          </View>
          <View style={styles.actionRow}>
            <Button mode="outlined" onPress={handleGenerate} style={styles.actionBtn}>🔄 Regenerate</Button>
            <Button mode="contained" onPress={() => navigation.navigate('SchedulePost', { contentId: 'new' })} style={styles.actionBtn}>📅 Schedule</Button>
          </View>
        </View>
      )}

      {!isGenerating && !generatedUrl && (
        <Button
          mode="contained"
          onPress={handleGenerate}
          disabled={!prompt.trim()}
          style={styles.generateBtn}
          icon="sparkles"
        >
          ✨ Generate Image
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  heading: { color: colors.text, fontWeight: 'bold', marginBottom: spacing.lg },
  label: { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { marginBottom: spacing.sm, backgroundColor: '#fff' },
  segmented: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  progressContainer: { marginVertical: spacing.lg },
  progressBar: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginTop: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  preview: { marginTop: spacing.lg },
  previewBox: { height: 300, backgroundColor: '#f5f5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewText: { color: colors.success },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md },
  actionBtn: { flex: 1, marginHorizontal: spacing.sm },
  generateBtn: { marginTop: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary },
});
