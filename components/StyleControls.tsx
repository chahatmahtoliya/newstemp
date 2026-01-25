import React from 'react';
import { Sliders, Palette } from 'lucide-react';
import { StyleSettings } from '../types';

interface StyleControlsProps {
    settings: StyleSettings;
    onChange: (settings: StyleSettings) => void;
}

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, unit = 'px', onChange }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono text-news-red">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-news-red"
        />
    </div>
);

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-500">{value}</span>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-600 bg-transparent"
            />
        </div>
    </div>
);

const StyleControls: React.FC<StyleControlsProps> = ({ settings, onChange }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const updateSetting = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Style Settings</span>
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    {/* Font Sizes */}
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                            <span className="mr-2">📏</span> Font Sizes
                        </h4>
                        <Slider
                            label="Headline"
                            value={settings.headlineFontSize}
                            min={50}
                            max={120}
                            onChange={(v) => updateSetting('headlineFontSize', v)}
                        />
                        <Slider
                            label="Description"
                            value={settings.descriptionFontSize}
                            min={24}
                            max={60}
                            onChange={(v) => updateSetting('descriptionFontSize', v)}
                        />
                    </div>

                    {/* Colors */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center">
                            <Palette className="w-3 h-3 mr-2" /> Colors
                        </h4>
                        <ColorPicker
                            label="Headline"
                            value={settings.headlineColor}
                            onChange={(v) => updateSetting('headlineColor', v)}
                        />
                        <ColorPicker
                            label="Description"
                            value={settings.descriptionColor}
                            onChange={(v) => updateSetting('descriptionColor', v)}
                        />
                        <ColorPicker
                            label="Banner"
                            value={settings.bannerColor}
                            onChange={(v) => updateSetting('bannerColor', v)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StyleControls;
