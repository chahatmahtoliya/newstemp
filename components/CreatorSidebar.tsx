import React, { useState } from 'react';
import {
    Image,
    Video,
    Smile,
    Film,
    Layout,
    Type,
    Palette,
    Shapes,
    Upload,
    ChevronLeft,
    ChevronRight,
    Home,
    FolderOpen,
    Sparkles
} from 'lucide-react';

interface SidebarCategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    items?: { id: string; name: string; thumbnail?: string }[];
}

interface CreatorSidebarProps {
    darkMode: boolean;
    onCategorySelect: (categoryId: string) => void;
    selectedCategory: string | null;
}

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
    {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
        id: 'templates',
        label: 'Templates',
        icon: <Layout className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
        id: 'images',
        label: 'Images',
        icon: <Image className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
        id: 'videos',
        label: 'Videos',
        icon: <Video className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-red-500 to-orange-500'
    },
    {
        id: 'meme-templates',
        label: 'Meme Templates',
        icon: <Smile className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
        id: 'video-templates',
        label: 'Video Templates',
        icon: <Film className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    },
    {
        id: 'text',
        label: 'Text',
        icon: <Type className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-slate-500 to-gray-600'
    },
    {
        id: 'elements',
        label: 'Elements',
        icon: <Shapes className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-teal-500 to-cyan-500'
    },
    {
        id: 'uploads',
        label: 'Uploads',
        icon: <Upload className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-violet-500 to-purple-600'
    },
    {
        id: 'ai',
        label: 'AI Magic',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
];

// Sample template data for each category
const TEMPLATE_DATA: Record<string, { id: string; name: string; thumbnail: string }[]> = {
    'templates': [
        { id: 't1', name: 'Breaking News', thumbnail: '/templates/template_breaking_news_1769538066288.png' },
        { id: 't2', name: 'Quote Card', thumbnail: '/templates/template_quote_card_1769538092996.png' },
        { id: 't3', name: 'Sports Score', thumbnail: '/templates/template_sports_score_1769538110413.png' },
        { id: 't4', name: 'Announcement', thumbnail: '/templates/template_announcement_1769538128393.png' },
    ],
    'meme-templates': [
        { id: 'm1', name: 'Viral Meme', thumbnail: '' },
        { id: 'm2', name: 'Reaction Meme', thumbnail: '' },
        { id: 'm3', name: 'Quote Meme', thumbnail: '' },
        { id: 'm4', name: 'Comparison', thumbnail: '' },
    ],
    'video-templates': [
        { id: 'v1', name: 'News Intro', thumbnail: '' },
        { id: 'v2', name: 'Story Reel', thumbnail: '' },
        { id: 'v3', name: 'Slideshow', thumbnail: '' },
        { id: 'v4', name: 'Ken Burns', thumbnail: '' },
    ],
};

const CreatorSidebar: React.FC<CreatorSidebarProps> = ({ darkMode, onCategorySelect, selectedCategory }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const handleCategoryClick = (categoryId: string) => {
        if (activePanel === categoryId) {
            setActivePanel(null);
        } else {
            setActivePanel(categoryId);
            onCategorySelect(categoryId);
        }
    };

    return (
        <div className="flex h-full">
            {/* Icon Bar - Always visible */}
            <div className={`
        flex flex-col items-center py-4 px-2 
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        border-r transition-all duration-300
        ${isExpanded ? 'w-16' : 'w-16'}
      `}>
                {/* Logo/Collapse Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`
            p-2 rounded-lg mb-4 transition-all
            ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
          `}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {/* Category Icons */}
                <div className="flex-1 flex flex-col items-center space-y-1 overflow-y-auto">
                    {SIDEBAR_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`
                w-12 h-12 rounded-xl flex flex-col items-center justify-center
                transition-all duration-200 group relative
                ${activePanel === category.id
                                    ? `${category.color} text-white shadow-lg scale-105`
                                    : darkMode
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }
              `}
                            title={category.label}
                        >
                            {category.icon}
                            <span className={`
                text-[9px] mt-0.5 font-medium truncate w-full text-center
                ${activePanel === category.id ? 'text-white' : ''}
              `}>
                                {category.label.split(' ')[0]}
                            </span>

                            {/* Tooltip on hover when collapsed */}
                            {!isExpanded && (
                                <div className={`
                  absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                  whitespace-nowrap z-50
                  ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
                `}>
                                    {category.label}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Projects at bottom */}
                <button
                    className={`
            w-12 h-12 rounded-xl flex flex-col items-center justify-center mt-4
            transition-all duration-200
            ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
          `}
                    title="Projects"
                >
                    <FolderOpen className="w-5 h-5" />
                    <span className="text-[9px] mt-0.5 font-medium">Projects</span>
                </button>
            </div>

            {/* Expandable Panel */}
            <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
        ${isExpanded && activePanel ? 'w-64 border-r' : 'w-0'}
      `}>
                {activePanel && (
                    <div className="w-64 h-full flex flex-col">
                        {/* Panel Header */}
                        <div className={`
              px-4 py-3 border-b flex items-center justify-between
              ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {SIDEBAR_CATEGORIES.find(c => c.id === activePanel)?.label}
                            </h3>
                            <button
                                onClick={() => setActivePanel(null)}
                                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {/* Search Bar */}
                            <div className={`
                mb-3 relative
              `}>
                                <input
                                    type="text"
                                    placeholder={`Search ${SIDEBAR_CATEGORIES.find(c => c.id === activePanel)?.label.toLowerCase()}...`}
                                    className={`
                    w-full px-3 py-2 rounded-lg text-sm
                    ${darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                        }
                    border focus:outline-none focus:border-purple-500
                  `}
                                />
                            </div>

                            {/* Template Grid */}
                            {TEMPLATE_DATA[activePanel] ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {TEMPLATE_DATA[activePanel].map((item) => (
                                        <button
                                            key={item.id}
                                            className={`
                        aspect-square rounded-lg overflow-hidden border-2 transition-all
                        hover:border-purple-500 hover:scale-105
                        ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}
                      `}
                                        >
                                            {item.thumbnail ? (
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className={`
                          w-full h-full flex items-center justify-center
                          ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                        `}>
                                                    <span className={`text-xs text-center px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className={`
                  text-center py-8
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                                    <div className={`
                    w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
                    ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
                  `}>
                                        {SIDEBAR_CATEGORIES.find(c => c.id === activePanel)?.icon}
                                    </div>
                                    <p className="text-sm font-medium mb-1">
                                        {SIDEBAR_CATEGORIES.find(c => c.id === activePanel)?.label}
                                    </p>
                                    <p className="text-xs opacity-70">
                                        Coming soon...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorSidebar;
