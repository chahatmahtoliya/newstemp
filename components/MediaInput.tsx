import React, { useRef, useEffect, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Scissors, Film } from 'lucide-react';

interface MediaInputProps {
    label: string;
    onMediaSelect: (base64: string | null, type: 'image' | 'video') => void;
    selectedMedia: string | null;
    mediaType: 'image' | 'video';
    videoTimestamp: number;
    onTimestampChange: (timestamp: number) => void;
    outputMode: 'image' | 'video';
    onOutputModeChange: (mode: 'image' | 'video') => void;
}

export const MediaInput: React.FC<MediaInputProps> = ({
    label,
    onMediaSelect,
    selectedMedia,
    mediaType,
    videoTimestamp,
    onTimestampChange,
    outputMode,
    onOutputModeChange
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);

    // Handle file selection from input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    // Process file (image or video)
    const processFile = (file: File) => {
        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        reader.onloadend = () => {
            onMediaSelect(reader.result as string, isVideo ? 'video' : 'image');
        };
        reader.readAsDataURL(file);
    };

    // Handle paste event
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        processFile(file);
                    }
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [onMediaSelect]);

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
            processFile(file);
        }
    };

    // Handle video metadata loaded
    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
        }
    };

    // Update video current time when timestamp changes
    useEffect(() => {
        if (videoRef.current && mediaType === 'video') {
            videoRef.current.currentTime = videoTimestamp;
        }
    }, [videoTimestamp, mediaType]);

    const clearMedia = () => {
        onMediaSelect(null, 'image');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setVideoDuration(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">
                {label}
            </label>

            {!selectedMedia ? (
                <div
                    ref={dropZoneRef}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-all group
            ${isDragOver
                            ? 'border-news-red bg-news-red/10'
                            : 'border-gray-600 hover:border-news-red hover:bg-gray-800/50'
                        }`}
                >
                    <div className="flex space-x-3 mb-3">
                        <ImageIcon className={`w-8 h-8 transition-colors ${isDragOver ? 'text-news-red' : 'text-gray-500 group-hover:text-news-red'}`} />
                        <Video className={`w-8 h-8 transition-colors ${isDragOver ? 'text-news-red' : 'text-gray-500 group-hover:text-news-red'}`} />
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 text-center">
                        Click to upload, drag & drop, or <span className="text-news-red font-bold">paste (Ctrl+V)</span>
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Supports images and videos</span>
                </div>
            ) : (
                <div className="relative w-full border border-gray-700 rounded-md overflow-hidden">
                    {/* Preview */}
                    <div className="relative group">
                        {mediaType === 'video' ? (
                            <video
                                ref={videoRef}
                                src={selectedMedia}
                                onLoadedMetadata={handleVideoLoaded}
                                className="w-full h-32 object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                muted
                            />
                        ) : (
                            <img
                                src={selectedMedia}
                                alt="Preview"
                                className="w-full h-32 object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                            />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-white bg-black/50 px-2 py-1 rounded flex items-center">
                                    {mediaType === 'video' ? (
                                        <><Video className="w-3 h-3 mr-1" /> Video</>
                                    ) : (
                                        <><ImageIcon className="w-3 h-3 mr-1" /> Image</>
                                    )}
                                </span>
                                <button
                                    onClick={clearMedia}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                                    title="Remove media"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Video Output Options */}
                    {mediaType === 'video' && videoDuration > 0 && (
                        <div className="p-3 bg-gray-800/80 border-t border-gray-700">
                            {/* Output Mode Toggle */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Output Mode</span>
                                <div className="flex bg-gray-700 rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onOutputModeChange('image')}
                                        className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${outputMode === 'image'
                                                ? 'bg-news-red text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <ImageIcon className="w-3 h-3 mr-1" />
                                        Static Frame
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onOutputModeChange('video')}
                                        className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${outputMode === 'video'
                                                ? 'bg-news-red text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Film className="w-3 h-3 mr-1" />
                                        Full Video
                                    </button>
                                </div>
                            </div>

                            {/* Timestamp Slider - only show for static frame mode */}
                            {outputMode === 'image' && (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Scissors className="w-4 h-4 text-news-red flex-shrink-0" />
                                        <input
                                            type="range"
                                            min={0}
                                            max={videoDuration}
                                            step={0.1}
                                            value={videoTimestamp}
                                            onChange={(e) => onTimestampChange(parseFloat(e.target.value))}
                                            className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-news-red"
                                        />
                                        <span className="text-xs font-mono text-gray-400 w-12 text-right">
                                            {formatTime(videoTimestamp)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">Select frame for background</p>
                                </>
                            )}

                            {/* Video mode info */}
                            {outputMode === 'video' && (
                                <div className="flex items-center text-xs text-gray-400">
                                    <Film className="w-4 h-4 text-news-red mr-2" />
                                    <span>Full video ({formatTime(videoDuration)}) will be rendered with overlay</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, video/mp4, video/webm"
                className="hidden"
            />
        </div>
    );
};

export default MediaInput;
