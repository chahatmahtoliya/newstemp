import React from 'react';
import { Film, Grid, Move, Clock, Layers } from 'lucide-react';
import { MultiImageSettings, VideoMode, TransitionType, CollageLayout } from '../types';

interface VideoModeControlsProps {
    settings: MultiImageSettings;
    onChange: (settings: MultiImageSettings) => void;
    imageCount: number;
}

const videoModes: { value: VideoMode; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'single', label: 'Single', icon: <Film className="w-4 h-4" />, description: 'One image/video' },
    { value: 'slideshow', label: 'Slideshow', icon: <Layers className="w-4 h-4" />, description: 'Images cycle one-by-one' },
    { value: 'collage', label: 'Collage', icon: <Grid className="w-4 h-4" />, description: 'Grid layout' },
    { value: 'kenburns', label: 'Ken Burns', icon: <Move className="w-4 h-4" />, description: 'Cinematic pan/zoom' },
];

const transitions: { value: TransitionType; label: string }[] = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'crossfade', label: 'Crossfade' },
    { value: 'none', label: 'None' },
];

const collageLayouts: { value: CollageLayout; label: string }[] = [
    { value: '2x2', label: '2×2 Grid' },
    { value: '2x3', label: '2×3 Grid' },
    { value: '3x3', label: '3×3 Grid' },
];

export const VideoModeControls: React.FC<VideoModeControlsProps> = ({ settings, onChange, imageCount }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const updateSetting = <K extends keyof MultiImageSettings>(key: K, value: MultiImageSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    const isMultiImageMode = settings.videoMode !== 'single';

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Film className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Video Mode</span>
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    {/* Mode Selection */}
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                            <span className="mr-2">🎬</span> Mode
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {videoModes.map((mode) => (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => updateSetting('videoMode', mode.value)}
                                    className={`p-2 rounded-lg border text-left transition-all ${settings.videoMode === mode.value
                                            ? 'border-news-red bg-news-red/20 text-white'
                                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        {mode.icon}
                                        <span className="text-xs font-bold">{mode.label}</span>
                                    </div>
                                    <span className="text-xs opacity-70">{mode.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Multi-image settings */}
                    {isMultiImageMode && (
                        <>
                            {/* Duration */}
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                                    <Clock className="w-3 h-3 mr-2" /> Duration per Image
                                </h4>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="range"
                                        min={1}
                                        max={10}
                                        value={settings.imageDuration}
                                        onChange={(e) => updateSetting('imageDuration', parseInt(e.target.value))}
                                        className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-news-red"
                                    />
                                    <span className="text-xs font-mono text-news-red w-8">{settings.imageDuration}s</span>
                                </div>
                            </div>

                            {/* Transition (for slideshow and kenburns) */}
                            {(settings.videoMode === 'slideshow' || settings.videoMode === 'kenburns') && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                                        <span className="mr-2">✨</span> Transition
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {transitions.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => updateSetting('transitionType', t.value)}
                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${settings.transitionType === t.value
                                                        ? 'bg-news-red text-white'
                                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Collage Layout */}
                            {settings.videoMode === 'collage' && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                                        <Grid className="w-3 h-3 mr-2" /> Layout
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {collageLayouts.map((layout) => (
                                            <button
                                                key={layout.value}
                                                type="button"
                                                onClick={() => updateSetting('collageLayout', layout.value)}
                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${settings.collageLayout === layout.value
                                                        ? 'bg-news-red text-white'
                                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {layout.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image count hint */}
                            <div className="text-xs text-gray-500 flex items-center">
                                <span className="mr-1">📷</span>
                                {imageCount === 0
                                    ? 'Upload images below'
                                    : `${imageCount} image${imageCount !== 1 ? 's' : ''} selected`
                                }
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoModeControls;
