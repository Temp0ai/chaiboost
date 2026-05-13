import { useContentStore, ContentPiece } from '../stores/contentStore';

export const useContent = () => {
  const {
    contentPieces,
    selectedContent,
    isGenerating,
    generationProgress,
    isLoading,
    error,
    fetchContent,
    generateImage,
    generateVideo,
    generateCaption,
    selectContent,
    deleteContent,
    updateCaption,
  } = useContentStore();

  const handleFetchContent = async (filter?: string) => {
    await fetchContent(filter);
  };

  const handleGenerateImage = async (params: {
    prompt: string;
    style: string;
    contentType: string;
    includeLogo: boolean;
    textOverlay?: string;
  }) => {
    return await generateImage(params);
  };

  const handleGenerateVideo = async (params: {
    photos: string[];
    scenes: string[];
    musicMood: string;
  }) => {
    return await generateVideo(params);
  };

  const handleGenerateCaption = async (params: {
    topic: string;
    tone: string;
    platform: string;
  }) => {
    return await generateCaption(params);
  };

  const handleDeleteContent = async (id: string) => {
    await deleteContent(id);
  };

  const handleUpdateCaption = async (id: string, caption: string) => {
    await updateCaption(id, caption);
  };

  const getContentByType = (type?: string) => {
    if (!type || type === 'all') return contentPieces;
    return contentPieces.filter((c) => c.type === type);
  };

  return {
    contentPieces,
    selectedContent,
    isGenerating,
    generationProgress,
    isLoading,
    error,
    fetchContent: handleFetchContent,
    generateImage: handleGenerateImage,
    generateVideo: handleGenerateVideo,
    generateCaption: handleGenerateCaption,
    selectContent,
    deleteContent: handleDeleteContent,
    updateCaption: handleUpdateCaption,
    getContentByType,
  };
};
