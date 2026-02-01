import React, { useRef } from 'react';
import { Image, X, Move } from 'lucide-react';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface LogoUploadProps {
    logoImage: string | null;
    logoPosition: LogoPosition;
    logoSize: number;
    onLogoChange: (image: string | null) => void;
    onPositionChange: (position: LogoPosition) => void;
    onSizeChange: (size: number) => void;
}

const positions: { value: LogoPosition; label: string; icon: string }[] = [
    { value: 'top-left', label: 'Top Left', icon: '↖' },
    { value: 'top-right', label: 'Top Right', icon: '↗' },
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙' },
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘' },
];

export const LogoUpload: React.FC<LogoUploadProps> = ({
    logoImage,
    logoPosition,
    logoSize,
    onLogoChange,
    onPositionChange,
    onSizeChange
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExpanded, setIsExpanded] = React.useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onLogoChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onLogoChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Logo</span>
                    {logoImage && <span className="text-xs text-green-500">✓</span>}
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    {/* Upload area */}
                    {!logoImage ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-600 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-news-red hover:bg-gray-800/50 transition-all"
                        >
                            <Image className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-xs text-gray-400">Click to upload logo</span>
                            <span className="text-xs text-gray-600">PNG or JPG</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Logo preview */}
                            <div className="relative inline-block">
                                <img
                                    src={logoImage}
                                    alt="Logo"
                                    className="h-16 w-auto rounded bg-gray-800 p-1"
                                />
                                <button
                                    onClick={handleRemove}
                                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Position selector */}
                            <div>
                                <label className="text-xs text-gray-400 uppercase mb-2 block flex items-center">
                                    <Move className="w-3 h-3 mr-1" /> Position
                                </label>
                                <div className="grid grid-cols-4 gap-1">
                                    {positions.map((pos) => (
                                        <button
                                            key={pos.value}
                                            onClick={() => onPositionChange(pos.value)}
                                            className={`p-2 text-center rounded text-lg transition-all ${logoPosition === pos.value
                                                    ? 'bg-news-red text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                }`}
                                            title={pos.label}
                                        >
                                            {pos.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size slider */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs text-gray-400 uppercase">Size</label>
                                    <span className="text-xs font-mono text-news-red">{logoSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min={30}
                                    max={200}
                                    value={logoSize}
                                    onChange={(e) => onSizeChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-news-red"
                                />
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
};

export default LogoUpload;
