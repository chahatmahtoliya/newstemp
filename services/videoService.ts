/**
 * Video Generation Service
 * Renders news overlay on top of video using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { StyleSettings } from '../types';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg WASM - call this once before encoding
 */
export const initFFmpeg = async (onProgress?: (progress: number) => void): Promise<void> => {
    if (ffmpegLoaded && ffmpeg) return;

    ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
            onProgress(Math.round(progress * 100));
        }
    });

    // Load FFmpeg core from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegLoaded = true;
};

/**
 * Helper to wrap text on canvas (same as geminiService)
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
 * Draw news overlay on a canvas context
 */
function drawNewsOverlay(
    ctx: CanvasRenderingContext2D,
    headline: string,
    description: string,
    styles: StyleSettings,
    targetWidth: number,
    targetHeight: number
): void {
    // Add Vignette/Gradient Overlay
    const gradient = ctx.createLinearGradient(0, targetHeight * 0.4, 0, targetHeight);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0.8)");
    gradient.addColorStop(1, "rgba(0,0,0,0.95)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw 'BREAKING NEWS' Banner
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

    // Headline Setup
    const contentStartX = 60;
    const maxContentWidth = targetWidth - (contentStartX * 2);
    let currentY = targetHeight - 550;

    // Draw Headline
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

    // Divider Line
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
 * Generate a video with news overlay
 */
export const generateNewsVideo = async (
    headline: string,
    description: string,
    videoDataUrl: string,
    styleSettings: StyleSettings,
    onProgress?: (progress: number) => void
): Promise<string> => {
    // Initialize FFmpeg
    await initFFmpeg(onProgress);

    if (!ffmpeg) {
        throw new Error('FFmpeg not initialized');
    }

    // Ensure fonts are loaded
    await document.fonts.ready;

    // Convert data URL to blob and write to FFmpeg virtual filesystem
    const videoBlob = await fetch(videoDataUrl).then(r => r.blob());
    const videoData = await fetchFile(videoBlob);
    await ffmpeg.writeFile('input.mp4', videoData);

    // Get video metadata using a video element
    const video = document.createElement('video');
    video.muted = true;
    video.src = videoDataUrl;

    await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
        video.load();
    });

    const duration = video.duration;
    const fps = 30; // Target FPS
    const totalFrames = Math.floor(duration * fps);

    // Set standard dimensions
    const targetWidth = 1080;
    const targetHeight = 1350;

    // Create canvas for frame processing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;

    // Process each frame
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        const time = frameIndex / fps;
        video.currentTime = time;

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
            video.onseeked = () => resolve();
        });

        // Draw video frame with object-cover scaling
        const scale = Math.max(targetWidth / video.videoWidth, targetHeight / video.videoHeight);
        const x = (targetWidth / 2) - (video.videoWidth / 2) * scale;
        const y = (targetHeight / 2) - (video.videoHeight / 2) * scale;

        ctx.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);

        // Draw news overlay
        drawNewsOverlay(ctx, headline, description, styleSettings, targetWidth, targetHeight);

        // Convert canvas to PNG and write to FFmpeg
        const frameBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
        const frameData = await fetchFile(frameBlob);
        const frameFileName = `frame${String(frameIndex).padStart(5, '0')}.png`;
        await ffmpeg.writeFile(frameFileName, frameData);

        // Update progress (frame extraction phase: 0-50%)
        if (onProgress) {
            onProgress(Math.round((frameIndex / totalFrames) * 50));
        }
    }

    // Extract audio from original video (if any)
    try {
        await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'copy', 'audio.aac']);
    } catch {
        // Video might not have audio, that's okay
    }

    // Encode frames to video
    // Check if audio exists
    let hasAudio = false;
    try {
        const audioData = await ffmpeg.readFile('audio.aac');
        hasAudio = audioData && (audioData as Uint8Array).length > 0;
    } catch {
        hasAudio = false;
    }

    if (hasAudio) {
        await ffmpeg.exec([
            '-framerate', String(fps),
            '-i', 'frame%05d.png',
            '-i', 'audio.aac',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-shortest',
            '-y',
            'output.mp4'
        ]);
    } else {
        await ffmpeg.exec([
            '-framerate', String(fps),
            '-i', 'frame%05d.png',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-y',
            'output.mp4'
        ]);
    }

    // Read the output file
    const outputData = await ffmpeg.readFile('output.mp4');
    // FFmpeg returns Uint8Array for binary files, create blob directly
    const outputBlob = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });
    const outputUrl = URL.createObjectURL(outputBlob);

    // Cleanup - delete temporary files
    for (let i = 0; i < totalFrames; i++) {
        const frameFileName = `frame${String(i).padStart(5, '0')}.png`;
        try {
            await ffmpeg.deleteFile(frameFileName);
        } catch {
            // Ignore cleanup errors
        }
    }
    try {
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('audio.aac');
        await ffmpeg.deleteFile('output.mp4');
    } catch {
        // Ignore cleanup errors
    }

    if (onProgress) {
        onProgress(100);
    }

    return outputUrl;
};
