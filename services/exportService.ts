/**
 * Export Service - Multi-Platform Export System
 * Generates optimized exports for all major social media platforms
 */
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { StyleSettings } from '../types';

// Platform export configurations
export interface ExportPlatform {
    id: string;
    name: string;
    width: number;
    height: number;
    aspectRatio: string;
    category: 'square' | 'landscape' | 'portrait';
}

export const EXPORT_PLATFORMS: ExportPlatform[] = [
    // Square Formats (1:1)
    { id: 'instagram-feed', name: 'Instagram Feed', width: 1080, height: 1080, aspectRatio: '1:1', category: 'square' },
    { id: 'threads', name: 'Threads', width: 1080, height: 1080, aspectRatio: '1:1', category: 'square' },

    // Landscape Formats (16:9 and similar)
    { id: 'facebook', name: 'Facebook Post', width: 1200, height: 630, aspectRatio: '1.91:1', category: 'landscape' },
    { id: 'twitter', name: 'Twitter / X', width: 1200, height: 675, aspectRatio: '16:9', category: 'landscape' },
    { id: 'youtube', name: 'YouTube Thumbnail', width: 1280, height: 720, aspectRatio: '16:9', category: 'landscape' },
    { id: 'linkedin', name: 'LinkedIn', width: 1200, height: 627, aspectRatio: '1.91:1', category: 'landscape' },

    // Portrait Formats (9:16)
    { id: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'instagram-reels', name: 'Instagram Reels', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'facebook-story', name: 'Facebook Story', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'tiktok', name: 'TikTok', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'youtube-shorts', name: 'YouTube Shorts', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'snapchat', name: 'Snapchat', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },
    { id: 'whatsapp-status', name: 'WhatsApp Status', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },

    // Pinterest (2:3 portrait)
    { id: 'pinterest', name: 'Pinterest Pin', width: 1000, height: 1500, aspectRatio: '2:3', category: 'portrait' },
];

/**
 * Render content at a specific size
 */
export interface RenderConfig {
    headline: string;
    description: string;
    bannerText: string;
    backgroundImage: string | null;
    logoImage: string | null;
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    logoSize: number;
    styles: StyleSettings;
}

/**
 * Helper to wrap text on canvas
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
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
}

/**
 * Load image from URL/base64
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Render a news card at specific dimensions
 */
export async function renderAtSize(
    config: RenderConfig,
    targetWidth: number,
    targetHeight: number
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;

    // Ensure fonts are loaded
    await document.fonts.ready;

    // Calculate scale factor (base design is 1080x1350)
    const baseWidth = 1080;
    const baseHeight = 1350;
    const scaleX = targetWidth / baseWidth;
    const scaleY = targetHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);

    // Background
    if (config.backgroundImage) {
        try {
            const bgImg = await loadImage(config.backgroundImage);
            // Object-cover scaling
            const imgScale = Math.max(targetWidth / bgImg.width, targetHeight / bgImg.height);
            const x = (targetWidth - bgImg.width * imgScale) / 2;
            const y = (targetHeight - bgImg.height * imgScale) / 2;
            ctx.drawImage(bgImg, x, y, bgImg.width * imgScale, bgImg.height * imgScale);
        } catch {
            // Fallback to dark background
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        }
    } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, targetHeight * 0.3, 0, targetHeight);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.7)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Scaled dimensions
    const padding = 40 * scale;
    const bannerPadding = 15 * scale;

    // Banner (Breaking News)
    if (config.bannerText) {
        const bannerFontSize = Math.max(24, 32 * scale);
        ctx.font = `bold ${bannerFontSize}px Oswald`;
        const bannerMetrics = ctx.measureText(config.bannerText);
        const bannerWidth = bannerMetrics.width + bannerPadding * 2;
        const bannerHeight = bannerFontSize + bannerPadding;

        ctx.fillStyle = config.styles.bannerColor;
        ctx.fillRect(padding, padding, bannerWidth, bannerHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.bannerText, padding + bannerPadding, padding + bannerHeight / 2);
    }

    // Content area - positioned from bottom
    const contentPadding = padding;
    const maxContentWidth = targetWidth - contentPadding * 2;

    // Start content from bottom portion
    let contentY = targetHeight * 0.55;

    // Headline
    const headlineFontSize = Math.max(36, config.styles.headlineFontSize * scale * 0.8);
    ctx.fillStyle = config.styles.headlineColor;
    ctx.font = `bold ${headlineFontSize}px ${config.styles.headlineFont}`;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetX = 2 * scale;
    ctx.shadowOffsetY = 2 * scale;

    const headlineLineHeight = headlineFontSize * 1.15;
    const headlineEndY = wrapText(
        ctx,
        config.headline.toUpperCase(),
        contentPadding,
        contentY,
        maxContentWidth,
        headlineLineHeight
    );

    // Divider line
    contentY = headlineEndY + 20 * scale;
    ctx.fillStyle = config.styles.bannerColor;
    ctx.shadowColor = 'transparent';
    ctx.fillRect(contentPadding, contentY, 100 * scale, 4 * scale);

    // Description
    contentY += 30 * scale;
    const descFontSize = Math.max(18, config.styles.descriptionFontSize * scale * 0.8);
    ctx.fillStyle = config.styles.descriptionColor;
    ctx.font = `${descFontSize}px ${config.styles.descriptionFont}`;
    const descLineHeight = descFontSize * 1.4;

    wrapText(ctx, config.description, contentPadding, contentY, maxContentWidth, descLineHeight);

    // Logo
    if (config.logoImage) {
        try {
            const logoImg = await loadImage(config.logoImage);
            const logoSize = config.logoSize * scale;
            const logoMargin = 20 * scale;

            let logoX = logoMargin;
            let logoY = logoMargin;

            switch (config.logoPosition) {
                case 'top-right':
                    logoX = targetWidth - logoSize - logoMargin;
                    break;
                case 'bottom-left':
                    logoY = targetHeight - logoSize - logoMargin;
                    break;
                case 'bottom-right':
                    logoX = targetWidth - logoSize - logoMargin;
                    logoY = targetHeight - logoSize - logoMargin;
                    break;
            }

            // Draw logo with aspect ratio
            const logoAspect = logoImg.width / logoImg.height;
            let drawWidth = logoSize;
            let drawHeight = logoSize / logoAspect;
            if (drawHeight > logoSize) {
                drawHeight = logoSize;
                drawWidth = logoSize * logoAspect;
            }

            ctx.drawImage(logoImg, logoX, logoY, drawWidth, drawHeight);
        } catch {
            // Skip logo if failed to load
        }
    }

    // Convert to blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
}

/**
 * Export for a single platform
 */
export async function exportForPlatform(
    config: RenderConfig,
    platform: ExportPlatform
): Promise<Blob> {
    return renderAtSize(config, platform.width, platform.height);
}

/**
 * Export for all platforms as ZIP
 */
export async function exportAllPlatforms(
    config: RenderConfig,
    onProgress?: (current: number, total: number, platformName: string) => void
): Promise<void> {
    const zip = new JSZip();
    const total = EXPORT_PLATFORMS.length;

    for (let i = 0; i < EXPORT_PLATFORMS.length; i++) {
        const platform = EXPORT_PLATFORMS[i];

        if (onProgress) {
            onProgress(i + 1, total, platform.name);
        }

        const blob = await exportForPlatform(config, platform);
        const filename = `newsflash_${platform.id}_${platform.width}x${platform.height}.png`;
        zip.file(filename, blob);
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `newsflash_all_platforms_${Date.now()}.zip`);
}

/**
 * Quick export for a single platform
 */
export async function quickExport(
    config: RenderConfig,
    platformId: string
): Promise<void> {
    const platform = EXPORT_PLATFORMS.find(p => p.id === platformId);
    if (!platform) throw new Error('Platform not found');

    const blob = await exportForPlatform(config, platform);
    saveAs(blob, `newsflash_${platform.id}_${platform.width}x${platform.height}.png`);
}
