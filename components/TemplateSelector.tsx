import React from 'react';
import { Layout } from 'lucide-react';
import { TEMPLATES, Template, TemplateType } from '../services/templateService';

interface TemplateSelectorProps {
    selected: TemplateType;
    onSelect: (template: Template) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selected, onSelect }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Template</span>
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    <div className="grid grid-cols-3 gap-2">
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => onSelect(template)}
                                className={`p-2 rounded-lg border text-center transition-all ${selected === template.id
                                        ? 'border-news-red bg-news-red/20 text-white'
                                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                <div className="text-xl mb-1">{template.icon}</div>
                                <div className="text-xs font-medium truncate">{template.name}</div>
                            </button>
                        ))}
                    </div>

                    {/* Selected template description */}
                    <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
                        {TEMPLATES.find(t => t.id === selected)?.description}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
