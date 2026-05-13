import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Sample scheduled posts
const scheduledPosts: Record<string, { title: string; time: string; type: string }[]> = {
  '2026-05-15': [{ title: 'Morning chai reel', time: '8:00 AM', type: 'reel' }],
  '2026-05-17': [{ title: 'Weekend special offer', time: '10:00 AM', type: 'image' }],
  '2026-05-20': [{ title: 'Tea fact carousel', time: '6:00 PM', type: 'carousel' }],
};

export const CalendarScreen = ({ navigation }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 14)); // May 14, 2026
  const [selectedDate, setSelectedDate] = useState('2026-05-14');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedPosts = scheduledPosts[selectedDate] || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayHeaders}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {dates.map((day, idx) => {
          if (!day) return <View key={idx} style={styles.dayCell} />;
          const dateStr = formatDate(day);
          const hasPost = !!scheduledPosts[dateStr];
          const isSelected = dateStr === selectedDate;
          const isToday = day === 14 && month === 4 && year === 2026;

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.dayCell, isSelected && styles.selectedDay, isToday && styles.todayCell]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText, isToday && styles.todayText]}>
                {day}
              </Text>
              {hasPost && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.agendaSection}>
        <Text variant="titleMedium" style={styles.agendaTitle}>
          {selectedDate}
        </Text>
        {selectedPosts.length === 0 ? (
          <Text variant="bodyMedium" style={styles.noPosts}>No posts scheduled</Text>
        ) : (
          selectedPosts.map((post, i) => (
            <TouchableOpacity
              key={i}
              style={styles.postCard}
              onPress={() => navigation.navigate('SchedulePost', { contentId: 'existing' })}
            >
              <MaterialCommunityIcons
                name={post.type === 'reel' ? 'video' : post.type === 'carousel' ? 'view-carousel' : 'image'}
                size={24}
                color={colors.primary}
              />
              <View style={styles.postInfo}>
                <Text variant="bodyLarge" style={styles.postTitle}>{post.title}</Text>
                <Text variant="bodySmall" style={styles.postTime}>{post.time}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('SchedulePost', { contentId: 'new' })}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  monthTitle: { fontWeight: 'bold', color: colors.text },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: spacing.sm },
  dayHeader: { flex: 1, textAlign: 'center', color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  selectedDay: { backgroundColor: colors.primary, borderRadius: 20 },
  todayCell: { borderWidth: 1, borderColor: colors.primary, borderRadius: 20 },
  dayText: { fontSize: 14, color: colors.text },
  selectedDayText: { color: '#fff', fontWeight: 'bold' },
  todayText: { fontWeight: 'bold' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, position: 'absolute', bottom: 6 },
  agendaSection: { flex: 1, padding: spacing.md, borderTopWidth: 1, borderTopColor: '#eee' },
  agendaTitle: { fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  noPosts: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  postCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm, elevation: 1 },
  postInfo: { flex: 1, marginLeft: spacing.md },
  postTitle: { fontWeight: '600', color: colors.text },
  postTime: { color: colors.textSecondary },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary },
});
