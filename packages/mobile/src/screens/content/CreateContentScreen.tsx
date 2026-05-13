import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const contentTypes = [
  { key: 'product_showcase', icon: 'coffee', label: 'Product Showcase', desc: 'Show off your best chai' },
  { key: 'promotional_offer', icon: 'tag', label: 'Promotional Offer', desc: 'Highlight deals & discounts' },
  { key: 'festival_greeting', icon: 'party-popper', label: 'Festival Greeting', desc: 'Seasonal greetings' },
  { key: 'customer_testimonial', icon: 'account-heart', label: 'Testimonial', desc: 'Share customer love' },
  { key: 'educational', icon: 'school', label: 'Tea Facts', desc: 'Educate your audience' },
  { key: 'behind_scenes', icon: 'camera', label: 'Behind the Scenes', desc: 'Show your process' },
];

export const CreateContentScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>What do you want to create?</Text>
      <Text variant="bodyMedium" style={styles.subheading}>Choose a content type and AI will help you build it</Text>
      <View style={styles.grid}>
        {contentTypes.map((type) => (
          <TouchableRipple
            key={type.key}
            onPress={() => navigation.navigate('ImageGenerator', { contentType: type.key })}
            style={styles.cardWrapper}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name={type.icon as any} size={36} color={colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>{type.label}</Text>
                <Text variant="bodySmall" style={styles.cardDesc}>{type.desc}</Text>
              </Card.Content>
            </Card>
          </TouchableRipple>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  heading: { color: colors.text, fontWeight: 'bold', marginBottom: spacing.xs },
  subheading: { color: colors.textSecondary, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardContent: { alignItems: 'center', paddingVertical: spacing.lg },
  cardTitle: { marginTop: spacing.sm, fontWeight: '600', textAlign: 'center' },
  cardDesc: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
});
