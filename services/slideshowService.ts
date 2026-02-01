/**
 * Slideshow/Collage/Ken Burns Video Generation Service
 * Creates videos from multiple images with various effects
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { StyleSettings, MultiImageSettings } from '../types';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg WASM
 */
export const initFFmpeg = async (onProgress?: (progress: number) => void): Promise<void> => {
    if (ffmpegLoaded && ffmpeg) return;

    ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
            onProgress(Math.round(progress * 100));
        }
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegLoaded = true;
};

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
 * Draw news overlay on canvas
 */
function drawNewsOverlay(
    ctx: CanvasRenderingContext2D,
    headline: string,
    description: string,
    styles: StyleSettings,
    targetWidth: number,
    targetHeight: number
): void {
    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, targetHeight * 0.4, 0, targetHeight);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0.8)");
    gradient.addColorStop(1, "rgba(0,0,0,0.95)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Breaking News Banner
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

    // Headline
    const contentStartX = 60;
    const maxContentWidth = targetWidth - (contentStartX * 2);
    let currentY = targetHeight - 550;

    ctx.fillStyle = styles.headlineColor;
    ctx.font = `bold ${styles.headlineFontSize}px ${styles.headlineFont}`;
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const headlineLineHeight = styles.headlineFontSize + 10;
    const headlineY = wrapText(ctx, headline.toUpperCase(), contentStartX, currentY, maxContentWidth, headlineLineHeight);
    currentY = headlineY + 30;

    // Divider
    ctx.fillStyle = styles.bannerColor;
    ctx.shadowColor = "transparent";
    ctx.fillRect(contentStartX, currentY, 150, 6);
    currentY += 40;

    // Description
    ctx.fillStyle = styles.descriptionColor;
    ctx.font = `${styles.descriptionFontSize}px ${styles.descriptionFont}`;
    const bodyLineHeight = styles.descriptionFontSize + 15;
    wrapText(ctx, description, contentStartX, currentY, maxContentWidth, bodyLineHeight);
}

/**
 * Load an image from base64 data URL
 */
async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = dataUrl;
    });
}

/**
 * Apply Ken Burns effect (pan/zoom) to image
 */
function applyKenBurns(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    progress: number, // 0-1
    targetWidth: number,
    targetHeight: number,
    effectSeed: number
): void {
    // Random starting position and zoom based on seed
    const startZoom = 1.0 + (effectSeed % 3) * 0.1;
    const endZoom = 1.2 + (effectSeed % 2) * 0.1;
    const zoom = startZoom + (endZoom - startZoom) * progress;

    const panX = ((effectSeed % 5) - 2) * 50 * progress;
    const panY = ((effectSeed % 4) - 2) * 30 * progress;

    const scale = Math.max(targetWidth / img.width, targetHeight / img.height) * zoom;
    const x = (targetWidth / 2) - (img.width / 2) * scale + panX;
    const y = (targetHeight / 2) - (img.height / 2) * scale + panY;

    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

/**
 * Draw image with object-cover scaling
 */
function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
): void {
    const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
    const x = (targetWidth / 2) - (img.width / 2) * scale;
    const y = (targetHeight / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

/**
 * Draw collage grid
 */
function drawCollage(
    ctx: CanvasRenderingContext2D,
    images: HTMLImageElement[],
    layout: '2x2' | '3x3' | '2x3',
    targetWidth: number,
    targetHeight: number,
    panOffset: number = 0
): void {
    const layouts = {
        '2x2': { cols: 2, rows: 2 },
        '3x3': { cols: 3, rows: 3 },
        '2x3': { cols: 3, rows: 2 },
    };

    const { cols, rows } = layouts[layout];
    const cellWidth = targetWidth / cols;
    const cellHeight = targetHeight / rows;
    const gap = 4;

    for (let i = 0; i < images.length && i < cols * rows; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const img = images[i];

        const x = col * cellWidth + gap / 2;
        const y = row * cellHeight + gap / 2;
        const w = cellWidth - gap;
        const h = cellHeight - gap;

        // Apply slight pan for animation
        const panX = Math.sin(panOffset + i) * 10;
        const panY = Math.cos(panOffset + i) * 10;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        const scale = Math.max(w / img.width, h / img.height) * 1.1;
        const imgX = x + (w / 2) - (img.width / 2) * scale + panX;
        const imgY = y + (h / 2) - (img.height / 2) * scale + panY;

        ctx.drawImage(img, imgX, imgY, img.width * scale, img.height * scale);
        ctx.restore();
    }
}

/**
 * Generate multi-image video
 */
export const generateMultiImageVideo = async (
    images: string[],
    headline: string,
    description: string,
    styleSettings: StyleSettings,
    multiImageSettings: MultiImageSettings,
    onProgress?: (progress: number) => void
): Promise<string> => {
    if (images.length === 0) {
        throw new Error('At least one image is required');
    }

    await initFFmpeg(onProgress);
    if (!ffmpeg) throw new Error('FFmpeg not initialized');

    await document.fonts.ready;

    // Load all images
    const loadedImages = await Promise.all(images.map(loadImage));

    const targetWidth = 1080;
    const targetHeight = 1350;
    const fps = 30;
    const { videoMode, imageDuration, transitionType, collageLayout } = multiImageSettings;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;

    let totalFrames: number;
    const transitionFrames = transitionType === 'none' ? 0 : Math.floor(fps * 0.5); // 0.5 second transitions

    if (videoMode === 'collage') {
        // Collage: all images for imageDuration seconds
        totalFrames = Math.floor(imageDuration * fps);
    } else {
        // Slideshow/KenBurns: each image for imageDuration seconds
        totalFrames = images.length * Math.floor(imageDuration * fps);
    }

    // Generate frames
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (videoMode === 'collage') {
            // Collage mode: draw all images in grid with subtle animation
            const panOffset = (frameIndex / totalFrames) * Math.PI * 2;
            drawCollage(ctx, loadedImages, collageLayout, targetWidth, targetHeight, panOffset);
        } else {
            // Slideshow or Ken Burns
            const framesPerImage = Math.floor(imageDuration * fps);
            const currentImageIndex = Math.floor(frameIndex / framesPerImage);
            const frameWithinImage = frameIndex % framesPerImage;
            const progressWithinImage = frameWithinImage / framesPerImage;

            const currentImage = loadedImages[Math.min(currentImageIndex, loadedImages.length - 1)];

            if (videoMode === 'kenburns') {
                applyKenBurns(ctx, currentImage, progressWithinImage, targetWidth, targetHeight, currentImageIndex);
            } else {
                drawImageCover(ctx, currentImage, targetWidth, targetHeight);
            }

            // Apply transition effect
            if (transitionType !== 'none' && currentImageIndex < loadedImages.length - 1) {
                const nextImage = loadedImages[currentImageIndex + 1];
                const transitionStart = framesPerImage - transitionFrames;

                if (frameWithinImage >= transitionStart) {
                    const transitionProgress = (frameWithinImage - transitionStart) / transitionFrames;

                    if (transitionType === 'fade' || transitionType === 'crossfade') {
                        ctx.globalAlpha = transitionProgress;
                        if (videoMode === 'kenburns') {
                            applyKenBurns(ctx, nextImage, 0, targetWidth, targetHeight, currentImageIndex + 1);
                        } else {
                            drawImageCover(ctx, nextImage, targetWidth, targetHeight);
                        }
                        ctx.globalAlpha = 1;
                    } else if (transitionType === 'slide') {
                        const slideOffset = transitionProgress * targetWidth;
                        ctx.save();
                        ctx.translate(-slideOffset, 0);
                        drawImageCover(ctx, currentImage, targetWidth, targetHeight);
                        ctx.translate(targetWidth, 0);
                        drawImageCover(ctx, nextImage, targetWidth, targetHeight);
                        ctx.restore();
                    }
                }
            }
        }

        // Draw news overlay
        drawNewsOverlay(ctx, headline, description, styleSettings, targetWidth, targetHeight);

        // Save frame
        const frameBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
        const frameData = await fetchFile(frameBlob);
        const frameFileName = `frame${String(frameIndex).padStart(5, '0')}.png`;
        await ffmpeg.writeFile(frameFileName, frameData);

        if (onProgress) {
            onProgress(Math.round((frameIndex / totalFrames) * 60));
        }
    }

    // Encode video
    await ffmpeg.exec([
        '-framerate', String(fps),
        '-i', 'frame%05d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-y',
        'output.mp4'
    ]);

    // Read output
    const outputData = await ffmpeg.readFile('output.mp4');
    const outputBlob = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });
    const outputUrl = URL.createObjectURL(outputBlob);

    // Cleanup
    for (let i = 0; i < totalFrames; i++) {
        try {
            await ffmpeg.deleteFile(`frame${String(i).padStart(5, '0')}.png`);
        } catch { /* ignore */ }
    }
    try {
        await ffmpeg.deleteFile('output.mp4');
    } catch { /* ignore */ }

    if (onProgress) onProgress(100);

    return outputUrl;
};
