// This service now handles local canvas generation instead of AI APIs
import { StyleSettings } from '../types';

/**
 * Helper to wrap text on HTML5 Canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Extract a single frame from a video at a given timestamp
 */
export const extractVideoFrame = (
  videoDataUrl: string,
  timestamp: number
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timestamp, video.duration);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0);

      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to create image from video frame'));
      img.src = canvas.toDataURL('image/png');
    };

    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = videoDataUrl;
  });
};

/**
 * Generates the news creative using HTML5 Canvas locally.
 * No API calls are made.
 */
export const generateNewsCreative = async (
  headline: string,
  description: string,
  uploadedMedia: string | null,
  mediaType: 'image' | 'video' = 'image',
  videoTimestamp: number = 0,
  styleSettings?: StyleSettings
): Promise<string> => {
  if (!uploadedMedia) {
    throw new Error("Background media is required");
  }

  // Default style settings
  const styles: StyleSettings = styleSettings || {
    headlineFontSize: 90,
    descriptionFontSize: 40,
    headlineColor: '#FFFFFF',
    descriptionColor: '#E5E5E5',
    bannerColor: '#D90000',
    headlineFont: 'Oswald',
    descriptionFont: 'Inter',
  };

  // Ensure fonts are loaded before drawing so metrics are accurate
  await document.fonts.ready;

  // Get the source image (either directly or from video frame)
  let sourceImage: HTMLImageElement;

  if (mediaType === 'video') {
    sourceImage = await extractVideoFrame(uploadedMedia, videoTimestamp);
  } else {
    sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = uploadedMedia;
    });
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    try {
      // Set standard social media portrait resolution
      const targetWidth = 1080;
      const targetHeight = 1350;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 1. Draw Background Image (Object-Cover style)
      const scale = Math.max(targetWidth / sourceImage.width, targetHeight / sourceImage.height);
      const x = (targetWidth / 2) - (sourceImage.width / 2) * scale;
      const y = (targetHeight / 2) - (sourceImage.height / 2) * scale;

      ctx.drawImage(sourceImage, x, y, sourceImage.width * scale, sourceImage.height * scale);

      // 2. Add Vignette/Gradient Overlay
      // Dark gradient at the bottom for text readability
      const gradient = ctx.createLinearGradient(0, targetHeight * 0.4, 0, targetHeight);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.6, "rgba(0,0,0,0.8)");
      gradient.addColorStop(1, "rgba(0,0,0,0.95)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 3. Draw 'BREAKING NEWS' Banner
      const bannerX = 60;
      const bannerY = 60;
      const bannerPadding = 20;

      ctx.font = "bold 40px Oswald";
      const bannerText = "BREAKING NEWS";
      const bannerMetrics = ctx.measureText(bannerText);
      const bannerWidth = bannerMetrics.width + (bannerPadding * 2);
      const bannerHeight = 70;

      ctx.fillStyle = styles.bannerColor;
      ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText(bannerText, bannerX + bannerPadding, bannerY + (bannerHeight / 2) + 2);

      // 4. Headline Setup
      const contentStartX = 60;
      const maxContentWidth = targetWidth - (contentStartX * 2);

      // Dynamic positioning based on font size
      let currentY = targetHeight - 550;

      // Draw Headline with dynamic styling
      ctx.fillStyle = styles.headlineColor;
      ctx.font = `bold ${styles.headlineFontSize}px ${styles.headlineFont}`;
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const headlineLineHeight = styles.headlineFontSize + 10;
      const headlineY = wrapText(ctx, headline.toUpperCase(), contentStartX, currentY, maxContentWidth, headlineLineHeight);

      currentY = headlineY + 30; // Spacing after headline

      // 5. Divider Line
      ctx.fillStyle = styles.bannerColor;
      ctx.shadowColor = "transparent"; // Remove shadow for line
      ctx.fillRect(contentStartX, currentY, 150, 6); // Short colored line

      currentY += 40; // Spacing after line

      // 6. Description with dynamic styling
      ctx.fillStyle = styles.descriptionColor;
      ctx.font = `${styles.descriptionFontSize}px ${styles.descriptionFont}`;
      const bodyLineHeight = styles.descriptionFontSize + 15;

      wrapText(ctx, description, contentStartX, currentY, maxContentWidth, bodyLineHeight);

      // Output
      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
};
