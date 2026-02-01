export interface StyleSettings {
  headlineFontSize: number;      // 50-120px
  descriptionFontSize: number;   // 24-60px
  headlineColor: string;         // hex color
  descriptionColor: string;      // hex color
  bannerColor: string;           // hex color for "BREAKING NEWS"
  headlineFont: string;          // font family for headline
  descriptionFont: string;       // font family for description
}

export type VideoMode = 'single' | 'slideshow' | 'collage' | 'kenburns';
export type TransitionType = 'fade' | 'slide' | 'crossfade' | 'none';
export type CollageLayout = '2x2' | '3x3' | '2x3';

export interface MultiImageSettings {
  videoMode: VideoMode;
  imageDuration: number;         // seconds per image (1-10)
  transitionType: TransitionType;
  collageLayout: CollageLayout;
}

export interface NewsData {
  headline: string;
  description: string;
  uploadedMedia: string | null;   // base64 data URL for single image/video
  mediaType: 'image' | 'video';
  videoTimestamp: number;         // seconds, for video frame extraction
  styleSettings: StyleSettings;
  outputMode: 'image' | 'video';  // 'image' = single frame, 'video' = full video with overlay
  // Multi-image mode
  multipleImages: string[];       // array of base64 data URLs
  multiImageSettings: MultiImageSettings;
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
  headlineFont: 'Oswald',
  descriptionFont: 'Inter',
};

// Default multi-image settings
export const defaultMultiImageSettings: MultiImageSettings = {
  videoMode: 'single',
  imageDuration: 3,
  transitionType: 'fade',
  collageLayout: '2x2',
};

// Available fonts for selection
export const availableFonts = [
  'Oswald',
  'Inter',
  'Roboto',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Bebas Neue',
  'Anton',
  'Lato',
  'Open Sans',
];