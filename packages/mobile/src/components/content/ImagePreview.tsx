import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

interface ImagePreviewProps {
  uri: string;
  aspectRatio?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  aspectRatio = 1,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { aspectRatio },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: undefined,
  },
});
