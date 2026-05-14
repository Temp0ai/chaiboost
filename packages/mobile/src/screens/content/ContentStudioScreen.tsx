import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Searchbar, Chip, Text } from 'react-native-paper';
import { useContentStore } from '../../stores/contentStore';
import { ContentCard } from '../../components/content/ContentCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const ContentStudioScreen = ({ navigation }: any) => {
  const { contentPieces, isLoading, fetchContent } = useContentStore();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const filteredContent = contentPieces.filter((c) => {
    if (filter !== 'all' && c.type !== filter) return false;
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) return <LoadingSpinner message="Loading content..." />;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search content..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />
      <View style={styles.chipRow}>
        {['all', 'image', 'video', 'carousel'].map((type) => (
          <Chip
            key={type}
            selected={filter === type}
            onPress={() => setFilter(type)}
            style={styles.chip}
            textStyle={filter === type ? styles.chipActiveText : undefined}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Chip>
        ))}
      </View>
      {filteredContent.length === 0 ? (
        <EmptyState
          icon="image-plus"
          title="No content yet"
          message="Create your first AI-powered post to get started!"
          actionLabel="Create Content"
          onAction={() => navigation.navigate('CreateContent')}
        />
      ) : (
        <FlatList
          data={filteredContent}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ContentCard
              thumbnailUrl={item.thumbnailUrl || item.mediaUrl || ''}
              title={item.title || item.caption || 'Untitled'}
              status={item.status === 'published' ? 'published' : item.status === 'scheduled' ? 'scheduled' : 'draft'}
              type={item.type === 'video' ? 'video' : item.type === 'carousel' ? 'carousel' : 'image'}
              onPress={() => navigation.navigate('ContentDetail', { id: item.id })}
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateContent')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: { margin: spacing.md, backgroundColor: '#fff' },
  chipRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  chip: { marginRight: spacing.sm },
  chipActiveText: { color: colors.primary },
  grid: { padding: spacing.sm },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary },
});
