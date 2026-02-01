import React, { useState } from 'react';
import { Newspaper, Download, Image as ImageIcon, Type, Palette, Grid, X, Moon, Sun, Save, Plus, Minus, Film, Layers, Move, Clock } from 'lucide-react';
import { generateNewsCreative } from './services/geminiService';
import { generateMultiImageVideo } from './services/slideshowService';
import { StyleSettings, defaultStyleSettings, MultiImageSettings, defaultMultiImageSettings, VideoMode, TransitionType, CollageLayout } from './types';
import CreatorSidebar from './components/CreatorSidebar';

// Template definition
interface VisualTemplate {
  id: string;
  name: string;
  thumbnail: string;
  defaultBanner: string;
}

const VISUAL_TEMPLATES: VisualTemplate[] = [
  { id: 'breaking-news', name: 'Breaking News', thumbnail: '/templates/template_breaking_news_1769538066288.png', defaultBanner: 'BREAKING NEWS' },
  { id: 'quote-card', name: 'Quote Card', thumbnail: '/templates/template_quote_card_1769538092996.png', defaultBanner: '' },
  { id: 'sports-score', name: 'Sports Score', thumbnail: '/templates/template_sports_score_1769538110413.png', defaultBanner: 'FINAL SCORE' },
  { id: 'announcement', name: 'Announcement', thumbnail: '/templates/template_announcement_1769538128393.png', defaultBanner: 'ANNOUNCEMENT' },
  { id: 'fact-card', name: 'Did You Know?', thumbnail: '/templates/template_fact_card_1769538157930.png', defaultBanner: 'DID YOU KNOW?' },
  { id: 'coming-soon', name: 'Coming Soon', thumbnail: '/templates/template_coming_soon_1769538173005.png', defaultBanner: 'COMING SOON' }
];

// Expanded font collection - organized by style
const FONTS = [
  // Bold Display Fonts (great for headlines)
  'Oswald', 'Anton', 'Bebas Neue', 'Staatliches', 'Russo One', 'Teko', 'Secular One', 'Titan One', 'Black Ops One', 'Bungee', 'Concert One', 'Bangers',
  // Modern Sans-Serif
  'Inter', 'Roboto', 'Montserrat', 'Poppins', 'Lato', 'Open Sans', 'Raleway', 'Nunito', 'Rubik', 'Ubuntu', 'Source Sans 3', 'Space Grotesk', 'Fredoka', 'Chakra Petch',
  // Elegant Serif
  'Playfair Display', 'Cinzel', 'Lobster',
  // Handwriting & Script
  'Pacifico', 'Dancing Script', 'Caveat', 'Great Vibes', 'Satisfy', 'Permanent Marker',
  // Gaming & Retro
  'Orbitron', 'Press Start 2P'
];

const videoModes: { value: VideoMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'single', label: 'Single', icon: <Film className="w-4 h-4" />, desc: 'One image/video' },
  { value: 'slideshow', label: 'Slideshow', icon: <Layers className="w-4 h-4" />, desc: 'Images cycle' },
  { value: 'collage', label: 'Collage', icon: <Grid className="w-4 h-4" />, desc: 'Grid layout' },
  { value: 'kenburns', label: 'Ken Burns', icon: <Move className="w-4 h-4" />, desc: 'Cinematic pan/zoom' },
];

const App: React.FC = () => {
  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // UI state
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeColorTab, setActiveColorTab] = useState<'banner' | 'headline' | 'desc'>('banner');
  const [selectedSidebarCategory, setSelectedSidebarCategory] = useState<string | null>(null);

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState<VisualTemplate | null>(null);

  // Content
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [bannerText, setBannerText] = useState('BREAKING NEWS');
  const [showBanner, setShowBanner] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Multi-image
  const [multipleImages, setMultipleImages] = useState<string[]>([]);
  const [multiImageSettings, setMultiImageSettings] = useState<MultiImageSettings>(defaultMultiImageSettings);

  // Style
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    ...defaultStyleSettings,
    headlineFont: 'Oswald',
    descriptionFont: 'Inter',
    headlineFontSize: 70,
    descriptionFontSize: 18,
    headlineColor: '#FFFFFF',
    descriptionColor: '#E5E5E5',
    bannerColor: '#DC2626'
  });

  // Generation
  const [generatedOutput, setGeneratedOutput] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const isMultiImageMode = multiImageSettings.videoMode !== 'single';
  const previewImage = uploadedImage || selectedTemplate?.thumbnail || null;

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMultipleImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelectTemplate = (template: VisualTemplate) => {
    setSelectedTemplate(template);
    setBannerText(template.defaultBanner);
    setShowBanner(!!template.defaultBanner);
    setShowTemplateSidebar(false);
  };

  const handleGenerate = async () => {
    if (!headline) return;
    setIsGenerating(true);

    try {
      if (isMultiImageMode && multipleImages.length > 0) {
        const videoUrl = await generateMultiImageVideo(
          multipleImages, headline, description, styleSettings, multiImageSettings,
          (p) => setVideoProgress(p)
        );
        setGeneratedOutput({ url: videoUrl, type: 'video' });
      } else {
        const imageUrl = await generateNewsCreative(
          headline, description, uploadedImage || selectedTemplate?.thumbnail || null,
          'image', 0, styleSettings
        );
        setGeneratedOutput({ url: imageUrl, type: 'image' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedOutput) {
      const link = document.createElement('a');
      link.href = generatedOutput.url;
      link.download = `newsflash-${Date.now()}.${generatedOutput.type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getActiveColor = () => {
    switch (activeColorTab) {
      case 'banner': return styleSettings.bannerColor;
      case 'headline': return styleSettings.headlineColor;
      case 'desc': return styleSettings.descriptionColor;
    }
  };

  const setActiveColor = (color: string) => {
    switch (activeColorTab) {
      case 'banner': setStyleSettings(prev => ({ ...prev, bannerColor: color })); break;
      case 'headline': setStyleSettings(prev => ({ ...prev, headlineColor: color })); break;
      case 'desc': setStyleSettings(prev => ({ ...prev, descriptionColor: color })); break;
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* ============ CREATOR SIDEBAR ============ */}
      <div className="hidden md:flex h-screen sticky top-0">
        <CreatorSidebar
          darkMode={darkMode}
          onCategorySelect={setSelectedSidebarCategory}
          selectedCategory={selectedSidebarCategory}
        />
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ============ HEADER ============ */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-red-500 p-2 rounded-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>NewsFlash </span>
                <span className="text-red-500 font-bold">Creator</span>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create Professional News Graphics</p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600"
            >
              <Type className="w-5 h-5" />
            </button>

            {/* Action buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setShowTemplateSidebar(true)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Grid className="w-4 h-4 mr-2" />
                Templates
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !headline}
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isGenerating ? 'Creating...' : 'Create Graphic'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!generatedOutput}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
          {/* ============ LEFT PANEL ============ */}
          <aside className={`
          ${showMobilePanel ? 'block' : 'hidden'} md:block
          w-full md:w-80 lg:w-96
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          md:min-h-[calc(100vh-57px)] overflow-y-auto
          p-4 md:p-6
          border-b md:border-b-0 md:border-r
          ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>

            {/* Video Mode Selection */}
            <div className="mb-6">
              <h3 className={`flex items-center text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Film className="w-4 h-4 mr-2 text-red-500" />
                Video Mode
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {videoModes.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setMultiImageSettings(prev => ({ ...prev, videoMode: mode.value }))}
                    className={`p-2 rounded-lg border text-left transition-all ${multiImageSettings.videoMode === mode.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : darkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      {mode.icon}
                      <span className="text-xs font-medium">{mode.label}</span>
                    </div>
                    <span className="text-xs opacity-60">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Image */}
            <div className="mb-6">
              <h3 className={`flex items-center text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ImageIcon className="w-4 h-4 mr-2 text-red-500" />
                Background Image
              </h3>

              {isMultiImageMode ? (
                // Multi-image upload
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {multipleImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16">
                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                        <button
                          onClick={() => setMultipleImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                    <ImageIcon className={`w-6 h-6 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add images</span>
                    <input type="file" accept="image/*" multiple onChange={handleMultiImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                // Single image upload
                uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Background" className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className={`text-xs text-center mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click to replace</p>
                  </div>
                ) : (
                  <label className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <ImageIcon className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click to replace</span>
                    <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )
              )}
            </div>

            {/* Text Content */}
            <div className="mb-6">
              <h3 className={`flex items-center text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Type className="w-4 h-4 mr-2 text-red-500" />
                Text Content
              </h3>

              {/* Banner Toggle */}
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Banner Text</label>
                <button
                  onClick={() => setShowBanner(!showBanner)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${showBanner ? 'bg-red-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showBanner ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              {showBanner && (
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 rounded-lg border text-sm mb-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-red-500`}
                />
              )}

              {/* Headline */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Headline <span className="text-red-500">*</span></label>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{headline.length}/50</span>
                </div>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={50}
                  placeholder="Enter headline..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:outline-none focus:border-red-500`}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{description.length}/300</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Enter description..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:outline-none focus:border-red-500`}
                />
              </div>
            </div>

            {/* Style Settings */}
            <div className="mb-6">
              <h3 className={`flex items-center text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Palette className="w-4 h-4 mr-2 text-red-500" />
                Style Settings
              </h3>

              {/* Headline Font */}
              <div className="mb-3">
                <label className={`text-sm block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Headline Font</label>
                <select
                  value={styleSettings.headlineFont}
                  onChange={(e) => setStyleSettings(prev => ({ ...prev, headlineFont: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-red-500`}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Headline Size */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Headline Size</label>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{styleSettings.headlineFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={120}
                  value={styleSettings.headlineFontSize}
                  onChange={(e) => setStyleSettings(prev => ({ ...prev, headlineFontSize: parseInt(e.target.value) }))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Description Font */}
              <div className="mb-3">
                <label className={`text-sm block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description Font</label>
                <select
                  value={styleSettings.descriptionFont}
                  onChange={(e) => setStyleSettings(prev => ({ ...prev, descriptionFont: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-red-500`}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Description Size */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description Size</label>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{styleSettings.descriptionFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={48}
                  value={styleSettings.descriptionFontSize}
                  onChange={(e) => setStyleSettings(prev => ({ ...prev, descriptionFontSize: parseInt(e.target.value) }))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Color Tabs */}
              <div className={`flex rounded-lg overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                {(['banner', 'headline', 'desc'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveColorTab(tab)}
                    className={`flex-1 py-2 text-xs font-medium uppercase transition-colors ${activeColorTab === tab
                      ? 'bg-red-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {tab === 'desc' ? 'Desc.' : tab}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="color"
                  value={getActiveColor()}
                  onChange={(e) => setActiveColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* ============ RIGHT PANEL - PREVIEW ============ */}
          <main className={`flex-1 p-4 md:p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-[calc(100vh-57px)] flex flex-col`}>
            {/* Preview Canvas */}
            <div className="flex-1 flex items-start justify-center pt-4 mb-4">
              <div
                className="bg-black rounded-xl overflow-hidden shadow-2xl transition-transform"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                {generatedOutput ? (
                  generatedOutput.type === 'video' ? (
                    <video src={generatedOutput.url} controls autoPlay loop className="max-w-full max-h-[70vh]" />
                  ) : (
                    <img src={generatedOutput.url} alt="Generated" className="max-w-full max-h-[70vh]" />
                  )
                ) : (
                  <div className="w-96 md:w-[500px] aspect-[4/5] relative">
                    {/* Background */}
                    {previewImage ? (
                      <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900" />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Icon button (top right) */}
                    <button className="absolute top-4 right-4 w-8 h-8 bg-gray-800/80 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {showBanner && bannerText && (
                        <div
                          className="inline-block px-3 py-1 text-xs font-bold mb-3 self-start uppercase tracking-wide"
                          style={{ backgroundColor: styleSettings.bannerColor, fontFamily: 'Oswald, sans-serif' }}
                        >
                          {bannerText}
                        </div>
                      )}

                      <h2
                        className="font-bold mb-3 leading-tight uppercase"
                        style={{
                          color: styleSettings.headlineColor,
                          fontFamily: `${styleSettings.headlineFont}, sans-serif`,
                          fontSize: `${Math.min(styleSettings.headlineFontSize * 0.5, 32)}px`,
                          wordBreak: 'break-word'
                        }}
                      >
                        {headline || 'TEMPLATE'}
                      </h2>

                      <p
                        className="leading-relaxed"
                        style={{
                          color: styleSettings.descriptionColor,
                          fontFamily: `${styleSettings.descriptionFont}, sans-serif`,
                          fontSize: `${Math.min(styleSettings.descriptionFontSize * 0.8, 14)}px`,
                          wordBreak: 'break-word'
                        }}
                      >
                        {description || 'Your description will appear here...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 mb-4">
              <button className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !headline}
                className="flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isGenerating ? `Creating... ${isMultiImageMode ? videoProgress + '%' : ''}` : 'Create Graphic'}
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex justify-end items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border border-gray-200'}`}>
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </main>
        </div>

        {/* ============ TEMPLATE SIDEBAR ============ */}
        {showTemplateSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowTemplateSidebar(false)} />
            <div className={`relative ml-auto w-80 h-full overflow-y-auto shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Templates</h2>
                  <button onClick={() => setShowTemplateSidebar(false)} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {VISUAL_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${selectedTemplate?.id === t.id ? 'border-red-500' : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                      </div>
                      <p className={`p-2 text-xs text-center font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around z-30">
          <button onClick={() => setShowMobilePanel(!showMobilePanel)} className="flex flex-col items-center text-gray-600">
            <Type className="w-5 h-5" />
            <span className="text-xs mt-1">Edit</span>
          </button>
          <button onClick={() => setShowTemplateSidebar(true)} className="flex flex-col items-center text-gray-600">
            <Grid className="w-5 h-5" />
            <span className="text-xs mt-1">Templates</span>
          </button>
          <button onClick={handleGenerate} disabled={isGenerating || !headline} className="flex flex-col items-center text-red-500">
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1">Create</span>
          </button>
          <button onClick={handleDownload} disabled={!generatedOutput} className="flex flex-col items-center text-green-500">
            <Download className="w-5 h-5" />
            <span className="text-xs mt-1">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;