import React, { useState } from 'react';
import { Newspaper, Download, Share2, Type, AlertCircle, Film } from 'lucide-react';
import { generateNewsCreative } from './services/geminiService';
import { generateNewsVideo } from './services/videoService';
import { NewsData, GenerationState, GeneratedOutput, defaultStyleSettings } from './types';
import Button from './components/Button';
import { Input, TextArea } from './components/Input';
import MediaInput from './components/MediaInput';
import StyleControls from './components/StyleControls';

const App: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData>({
    headline: '',
    description: '',
    uploadedMedia: null,
    mediaType: 'image',
    videoTimestamp: 0,
    styleSettings: defaultStyleSettings,
    outputMode: 'image'
  });
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    currentStep: 'idle',
    videoProgress: 0
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsData.headline || !newsData.description || !newsData.uploadedMedia) return;

    setState({
      isGenerating: true,
      error: null,
      currentStep: 'generating',
      videoProgress: 0
    });

    try {
      // Check if we should generate video or image
      if (newsData.mediaType === 'video' && newsData.outputMode === 'video') {
        // Generate full video with overlay
        setState(prev => ({ ...prev, currentStep: 'encoding' }));

        const videoUrl = await generateNewsVideo(
          newsData.headline,
          newsData.description,
          newsData.uploadedMedia!,
          newsData.styleSettings,
          (progress) => setState(prev => ({ ...prev, videoProgress: progress }))
        );

        setGeneratedOutput({ url: videoUrl, type: 'video' });
        setState({ isGenerating: false, error: null, currentStep: 'complete', videoProgress: 100 });
      } else {
        // Generate static image (existing behavior)
        setTimeout(async () => {
          try {
            const imageUrl = await generateNewsCreative(
              newsData.headline,
              newsData.description,
              newsData.uploadedMedia,
              newsData.mediaType,
              newsData.videoTimestamp,
              newsData.styleSettings
            );
            setGeneratedOutput({ url: imageUrl, type: 'image' });
            setState({ isGenerating: false, error: null, currentStep: 'complete', videoProgress: 0 });
          } catch (error) {
            console.error(error);
            setState({
              isGenerating: false,
              error: "Failed to render graphic. Please check your media.",
              currentStep: 'idle',
              videoProgress: 0
            });
          }
        }, 50);
      }
    } catch (error) {
      console.error(error);
      setState({
        isGenerating: false,
        error: "Failed to generate. Please try again.",
        currentStep: 'idle',
        videoProgress: 0
      });
    }
  };

  const handleDownload = () => {
    if (generatedOutput) {
      const link = document.createElement('a');
      link.href = generatedOutput.url;
      link.download = generatedOutput.type === 'video'
        ? `news-flash-${Date.now()}.mp4`
        : `news-flash-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getButtonText = () => {
    if (state.isGenerating) {
      if (state.currentStep === 'encoding') {
        return `Encoding Video... ${state.videoProgress}%`;
      }
      return 'Rendering...';
    }

    if (newsData.mediaType === 'video' && newsData.outputMode === 'video') {
      return 'Create News Video';
    }
    return 'Create News Card';
  };

  return (
    <div className="min-h-screen bg-news-dark text-white font-sans selection:bg-news-red selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-news-red p-2 rounded">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight uppercase">NewsFlash <span className="text-news-red">Creator</span></h1>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Instant News Graphics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-display font-bold uppercase mb-4 flex items-center">
                <Type className="w-4 h-4 mr-2 text-news-red" />
                News Details
              </h2>

              <form onSubmit={handleGenerate}>

                {/* Background Selection Section */}
                <div className="mb-6 space-y-4">
                  <MediaInput
                    label="Background Media (Image or Video)"
                    selectedMedia={newsData.uploadedMedia}
                    mediaType={newsData.mediaType}
                    videoTimestamp={newsData.videoTimestamp}
                    outputMode={newsData.outputMode}
                    onMediaSelect={(base64, type) => setNewsData(prev => ({
                      ...prev,
                      uploadedMedia: base64,
                      mediaType: type,
                      videoTimestamp: 0,
                      outputMode: 'image' // Reset to image when new media is selected
                    }))}
                    onTimestampChange={(timestamp) => setNewsData(prev => ({
                      ...prev,
                      videoTimestamp: timestamp
                    }))}
                    onOutputModeChange={(mode) => setNewsData(prev => ({
                      ...prev,
                      outputMode: mode
                    }))}
                  />
                </div>

                <div className="border-t border-gray-800 my-6"></div>

                <Input
                  label="Headline"
                  placeholder="e.g., LOCAL CAT WINS MAYORAL ELECTION"
                  value={newsData.headline}
                  onChange={(e) => setNewsData(prev => ({ ...prev, headline: e.target.value }))}
                  maxLength={150}
                />

                <TextArea
                  label="Short Description"
                  placeholder="e.g., In a stunning landslide victory, Mr. Whiskers secures 95% of the vote promising more nap times."
                  value={newsData.description}
                  onChange={(e) => setNewsData(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={120}
                  className="min-h-[120px]"
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={state.isGenerating}
                  disabled={!newsData.headline || !newsData.description || !newsData.uploadedMedia}
                >
                  {getButtonText()}
                </Button>

                {/* Video Progress Bar */}
                {state.isGenerating && state.currentStep === 'encoding' && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-news-red transition-all duration-300"
                        style={{ width: `${state.videoProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Processing video frames... This may take a while
                    </p>
                  </div>
                )}

                {state.error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-900 rounded flex items-start text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    {state.error}
                  </div>
                )}
              </form>
            </div>

            {/* Style Controls */}
            <StyleControls
              settings={newsData.styleSettings}
              onChange={(settings) => setNewsData(prev => ({ ...prev, styleSettings: settings }))}
            />

            {/* Tips Section */}
            <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg text-sm text-gray-400">
              <h3 className="font-bold text-gray-300 mb-2 uppercase text-xs tracking-wider">Pro Tips</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Paste images directly with <span className="text-news-red font-mono">Ctrl+V</span></li>
                <li>Use <span className="text-news-red font-bold">Full Video</span> mode for animated backgrounds</li>
                <li>Adjust colors to match your brand</li>
                <li>Keep headlines short (3-6 words) for impact</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8">
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
              {/* Media Display Area */}
              <div className="relative flex-grow flex items-center justify-center bg-gray-900/50 min-h-[500px]">
                {generatedOutput ? (
                  generatedOutput.type === 'video' ? (
                    <video
                      src={generatedOutput.url}
                      controls
                      autoPlay
                      loop
                      className="max-w-full max-h-[700px] w-auto h-auto object-contain shadow-lg"
                    />
                  ) : (
                    <img
                      src={generatedOutput.url}
                      alt="Generated News Creative"
                      className="max-w-full max-h-[700px] w-auto h-auto object-contain shadow-lg"
                    />
                  )
                ) : (
                  <div className="text-center p-8">
                    {state.isGenerating ? (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-news-red border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-mono animate-pulse uppercase">
                          {state.currentStep === 'encoding'
                            ? `Encoding Video... ${state.videoProgress}%`
                            : 'Rendering Graphic...'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-600">
                        <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                          <Share2 className="w-12 h-12 opacity-50" />
                        </div>
                        <p className="uppercase tracking-widest text-sm font-bold">Ready to broadcast</p>
                        <p className="text-sm mt-2 max-w-xs">Upload an image/video and enter text to generate a professional news card instantly.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Area */}
              {generatedOutput && (
                <div className="border-t border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold uppercase text-lg flex items-center">
                        {generatedOutput.type === 'video' && <Film className="w-5 h-5 mr-2 text-news-red" />}
                        Result
                      </h3>
                      <p className="text-xs text-gray-500">
                        {generatedOutput.type === 'video' ? 'Video with News Overlay' : 'Professional News Template'}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={() => setGeneratedOutput(null)} variant="secondary">
                        Reset
                      </Button>
                      <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download {generatedOutput.type === 'video' ? 'MP4' : 'PNG'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;