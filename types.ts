export interface StyleSettings {
  headlineFontSize: number;      // 50-120px
  descriptionFontSize: number;   // 24-60px
  headlineColor: string;         // hex color
  descriptionColor: string;      // hex color
  bannerColor: string;           // hex color for "BREAKING NEWS"
}

export interface NewsData {
  headline: string;
  description: string;
  uploadedMedia: string | null;   // base64 data URL
  mediaType: 'image' | 'video';
  videoTimestamp: number;         // seconds, for video frame extraction
  styleSettings: StyleSettings;
  outputMode: 'image' | 'video';  // 'image' = single frame, 'video' = full video with overlay
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  currentStep: 'idle' | 'generating' | 'encoding' | 'complete';
  videoProgress: number;          // 0-100 for video encoding progress
}

export interface GeneratedOutput {
  url: string;        // Base64 data URL or blob URL
  type: 'image' | 'video';
}

// Default style settings
export const defaultStyleSettings: StyleSettings = {
  headlineFontSize: 90,
  descriptionFontSize: 40,
  headlineColor: '#FFFFFF',
  descriptionColor: '#E5E5E5',
  bannerColor: '#D90000',
};