import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileScoreCard } from '../../components/dashboard/ProfileScoreCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { AISuggestionCard } from '../../components/dashboard/AISuggestionCard';
import { RecentContent } from '../../components/dashboard/RecentContent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  navigation: any;
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const quickActions = [
    {
      icon: 'image-plus',
      label: 'Create Post',
      onPress: () => navigation.navigate('ContentTab', { screen: 'CreateContent' }),
      color: colors.primary,
    },
    {
      icon: 'calendar-plus',
      label: 'Schedule',
      onPress: () => navigation.navigate('ScheduleTab'),
      color: colors.accent,
    },
    {
      icon: 'star-outline',
      label: 'Reviews',
      onPress: () => navigation.navigate('EngagementTab'),
      color: colors.secondary,
    },
    {
      icon: 'chart-line',
      label: 'Analytics',
      onPress: () => navigation.navigate('AnalyticsTab'),
      color: colors.success,
    },
    {
      icon: 'lightbulb-outline',
      label: 'AI Ideas',
      onPress: () => {},
      color: colors.warning,
    },
    {
      icon: 'trending-up',
      label: 'Trends',
      onPress: () => navigation.navigate('EngagementTab', { screen: 'Trends' }),
      color: colors.instagram,
    },
    {
      icon: 'video-outline',
      label: 'Reels',
      onPress: () => navigation.navigate('ContentTab', { screen: 'VideoGenerator' }),
      color: colors.facebook,
    },
    {
      icon: 'cog-outline',
      label: 'Settings',
      onPress: () => {},
      color: colors.textSecondary,
    },
  ];

  const recentContent = [
    { id: '1', thumbnailUrl: 'https://picsum.photos/200', type: 'image' as const, status: 'published' as const },
    { id: '2', thumbnailUrl: 'https://picsum.photos/201', type: 'video' as const, status: 'scheduled' as const },
    { id: '3', thumbnailUrl: 'https://picsum.photos/202', type: 'image' as const, status: 'draft' as const },
    { id: '4', thumbnailUrl: 'https://picsum.photos/203', type: 'image' as const, status: 'published' as const },
    { id: '5', thumbnailUrl: 'https://picsum.photos/204', type: 'video' as const, status: 'draft' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning ☕</Text>
            <Text style={styles.userName}>Chai Entrepreneur</Text>
          </View>
        </View>

        <ProfileScoreCard score={72} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActions actions={quickActions} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Suggestion</Text>
          <AISuggestionCard
            suggestion="Post a behind-the-scenes video of your chai preparation process. Authentic content gets 3x more engagement!"
            type="content"
            onCreateNow={() =>
              navigation.navigate('ContentTab', { screen: 'ImageGenerator' })
            }
          />
        </View>

        <View style={styles.section}>
          <RecentContent
            items={recentContent}
            onItemPress={(item) =>
              navigation.navigate('ContentTab', {
                screen: 'ContentDetail',
                params: { contentId: item.id },
              })
            }
            onViewAll={() =>
              navigation.navigate('ContentTab', { screen: 'ContentStudio' })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
  },
  greeting: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
});
