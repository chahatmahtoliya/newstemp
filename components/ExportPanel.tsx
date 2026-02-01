import React, { useState } from 'react';
import { Download, Package, Check } from 'lucide-react';
import { EXPORT_PLATFORMS, ExportPlatform, exportAllPlatforms, quickExport, RenderConfig } from '../services/exportService';
import Button from './Button';

interface ExportPanelProps {
    renderConfig: RenderConfig;
    disabled?: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ renderConfig, disabled }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<{ current: number; total: number; platform: string } | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['instagram-feed']));
    const [lastExported, setLastExported] = useState<string | null>(null);

    const togglePlatform = (id: string) => {
        const newSelected = new Set(selectedPlatforms);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPlatforms(newSelected);
    };

    const handleExportAll = async () => {
        setIsExporting(true);
        setExportProgress({ current: 0, total: EXPORT_PLATFORMS.length, platform: '' });

        try {
            await exportAllPlatforms(renderConfig, (current, total, platform) => {
                setExportProgress({ current, total, platform });
            });
            setLastExported('all');
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
            setExportProgress(null);
        }
    };

    const handleQuickExport = async (platformId: string) => {
        setIsExporting(true);
        try {
            await quickExport(renderConfig, platformId);
            setLastExported(platformId);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const groupedPlatforms = {
        square: EXPORT_PLATFORMS.filter(p => p.category === 'square'),
        landscape: EXPORT_PLATFORMS.filter(p => p.category === 'landscape'),
        portrait: EXPORT_PLATFORMS.filter(p => p.category === 'portrait'),
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Export</span>
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    {/* Export All Button */}
                    <Button
                        onClick={handleExportAll}
                        disabled={disabled || isExporting}
                        isLoading={isExporting && exportProgress !== null}
                        className="w-full mb-4"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        {exportProgress
                            ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
                            : 'Export All Platforms (ZIP)'
                        }
                    </Button>

                    {/* Progress bar */}
                    {exportProgress && (
                        <div className="mb-4">
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-news-red transition-all"
                                    style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                {exportProgress.platform}
                            </p>
                        </div>
                    )}

                    {/* Individual Platform Export */}
                    <div className="space-y-3">
                        {/* Square */}
                        <div>
                            <h4 className="text-xs text-gray-500 uppercase mb-2">Square (1:1)</h4>
                            <div className="flex flex-wrap gap-1">
                                {groupedPlatforms.square.map((platform) => (
                                    <PlatformButton
                                        key={platform.id}
                                        platform={platform}
                                        isExporting={isExporting}
                                        wasExported={lastExported === platform.id}
                                        onClick={() => handleQuickExport(platform.id)}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Landscape */}
                        <div>
                            <h4 className="text-xs text-gray-500 uppercase mb-2">Landscape (16:9)</h4>
                            <div className="flex flex-wrap gap-1">
                                {groupedPlatforms.landscape.map((platform) => (
                                    <PlatformButton
                                        key={platform.id}
                                        platform={platform}
                                        isExporting={isExporting}
                                        wasExported={lastExported === platform.id}
                                        onClick={() => handleQuickExport(platform.id)}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Portrait */}
                        <div>
                            <h4 className="text-xs text-gray-500 uppercase mb-2">Portrait (9:16)</h4>
                            <div className="flex flex-wrap gap-1">
                                {groupedPlatforms.portrait.map((platform) => (
                                    <PlatformButton
                                        key={platform.id}
                                        platform={platform}
                                        isExporting={isExporting}
                                        wasExported={lastExported === platform.id}
                                        onClick={() => handleQuickExport(platform.id)}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface PlatformButtonProps {
    platform: ExportPlatform;
    isExporting: boolean;
    wasExported: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const PlatformButton: React.FC<PlatformButtonProps> = ({
    platform,
    isExporting,
    wasExported,
    onClick,
    disabled
}) => (
    <button
        onClick={onClick}
        disabled={disabled || isExporting}
        className={`px-2 py-1 text-xs rounded border transition-all flex items-center space-x-1 ${wasExported
                ? 'border-green-600 bg-green-600/20 text-green-400'
                : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-news-red hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {wasExported && <Check className="w-3 h-3" />}
        <span>{platform.name}</span>
        <span className="text-gray-600">({platform.aspectRatio})</span>
    </button>
);

export default ExportPanel;
