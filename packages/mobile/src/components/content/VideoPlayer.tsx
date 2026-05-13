import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

interface VideoPlayerProps {
  uri: string;
  aspectRatio?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  aspectRatio = 16 / 9,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={[styles.container, { aspectRatio }]}>
      <View style={styles.placeholder}>
        <MaterialCommunityIcons
          name="video"
          size={48}
          color={colors.textLight}
        />
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setIsPlaying(!isPlaying)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
