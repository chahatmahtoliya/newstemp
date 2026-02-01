import React from 'react';
import { Palette } from 'lucide-react';
import { STYLE_PRESETS, StylePreset, applyPreset } from '../services/presetService';
import { StyleSettings } from '../types';

interface PresetSelectorProps {
    onApply: (settings: StyleSettings, presetId: string) => void;
    currentPresetId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onApply, currentPresetId }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const handleSelect = (preset: StylePreset) => {
        const settings = applyPreset(preset);
        onApply(settings, preset.id);
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Style Preset</span>
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                        {STYLE_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handleSelect(preset)}
                                className={`p-2 rounded-lg border text-left transition-all ${currentPresetId === preset.id
                                        ? 'border-news-red bg-news-red/20'
                                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-lg">{preset.icon}</span>
                                    <span className="text-xs font-bold text-white">{preset.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{preset.description}</p>

                                {/* Color preview */}
                                <div className="flex space-x-1 mt-2">
                                    <div
                                        className="w-4 h-4 rounded-sm border border-gray-600"
                                        style={{ backgroundColor: preset.colors.banner }}
                                        title="Banner"
                                    />
                                    <div
                                        className="w-4 h-4 rounded-sm border border-gray-600"
                                        style={{ backgroundColor: preset.colors.headline }}
                                        title="Headline"
                                    />
                                    <div
                                        className="w-4 h-4 rounded-sm border border-gray-600"
                                        style={{ backgroundColor: preset.colors.description }}
                                        title="Description"
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PresetSelector;
