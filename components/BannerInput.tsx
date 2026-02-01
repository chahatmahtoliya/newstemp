import React from 'react';
import { Tag } from 'lucide-react';

interface BannerInputProps {
    value: string;
    onChange: (value: string) => void;
    showBanner: boolean;
    onToggleBanner: (show: boolean) => void;
}

export const BannerInput: React.FC<BannerInputProps> = ({
    value,
    onChange,
    showBanner,
    onToggleBanner
}) => {
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    Banner Text
                </label>
                <button
                    onClick={() => onToggleBanner(!showBanner)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${showBanner
                            ? 'bg-news-red text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                >
                    {showBanner ? 'ON' : 'OFF'}
                </button>
            </div>

            {showBanner && (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    placeholder="BREAKING NEWS"
                    maxLength={30}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-news-red placeholder-gray-600 uppercase"
                />
            )}

            {showBanner && (
                <p className="text-xs text-gray-600 mt-1">
                    {value.length}/30 characters
                </p>
            )}
        </div>
    );
};

export default BannerInput;
