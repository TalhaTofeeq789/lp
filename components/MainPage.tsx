import { useState } from 'react';
import { Brain, Save, Eye, Sparkles, Zap, Code, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrapedDataSection } from './ScrapedDataSection';
import { FullScreenPreviewDialog } from './FullScreenPreviewDialog';
import { LivePreview } from './LivePreview';

interface ScrapedElement {
  id: string;
  type: string;
  label: string;
  originalText: string;
  importance: 'high' | 'medium' | 'low';
  suggestions: string[];
}

interface ScrapedData {
  url: string;
  title: string;
  elements: ScrapedElement[];
  totalElements: number;
  html?: string; // Add HTML field for complete page source
}

interface ApiSuggestion {
  ai_error: string | null;
  ai_suggestions: string[];
  original: string;
}

interface ApiResponse {
  ai_enhanced: boolean;
  data: Array<{
    ai_enhanced: boolean;
    call_to_action: ApiSuggestion[];
    description_credibility: ApiSuggestion[];
    headline: ApiSuggestion[];
    html: string;
    subheadline: ApiSuggestion[];
  }>;
  processing_info: {
    ai_model: string;
    content_types_enhanced: string[];
    suggestions_per_item: number;
    total_urls: number;
  };
  status: string;
}

interface CompleteScraperResult {
  url: string;
  complete_html: string;
  css_files_processed: number;
  success: boolean;
}

interface CompleteScraperResponse {
  status: string;
  data: CompleteScraperResult[];
  scraping_type: string;
  processing_info: {
    total_urls: number;
    includes: string[];
    note: string;
  };
}

export function MainPage({ 
  isLivePreviewOpen,
  onToggleSidebar,
  onAnalyze 
}: {
  isLivePreviewOpen?: boolean;
  onToggleSidebar?: () => void;
  onAnalyze?: () => void;
}) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [selectedElementsCount, setSelectedElementsCount] = useState(0);
  const [showHtml, setShowHtml] = useState(false);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [modifiedHtml, setModifiedHtml] = useState('');
  const [savedChanges, setSavedChanges] = useState<Map<string, { original: string, modified: string }>>(new Map());
  const [livePreviewHtml, setLivePreviewHtml] = useState('');
  const [currentBaseUrl, setCurrentBaseUrl] = useState('');
  const [completeHtml, setCompleteHtml] = useState(''); // Store complete HTML with CSS from second API

  // Helper function to normalize URL
  const normalizeUrl = (inputUrl: string) => {
    let normalizedUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  const handleScrapeData = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    const normalizedUrl = normalizeUrl(url);
    
    // Add a simple connectivity test
    console.log('Testing API connectivity...');
    console.log('Normalized URL:', normalizedUrl);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://web-scraper-backend-kappa.vercel.app';
      
      // Call both APIs simultaneously for better performance
      console.log('Calling both APIs simultaneously for:', normalizedUrl);
      const [lpOptimizationResponse, completeScraperResponse] = await Promise.all([
        // LP Optimization API call
        fetch('https://web-scraper-backend-kappa.vercel.app/scrape', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ urls: [normalizedUrl] })
        }),
        // Complete Scraper API call
        fetch('https://web-scraper-backend-kappa.vercel.app/scrape-complete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ urls: [normalizedUrl] })
        })
      ]);

      console.log('LP Optimization API response status:', lpOptimizationResponse.status);
      console.log('Complete Scraper API response status:', completeScraperResponse.status);

      if (!lpOptimizationResponse.ok) {
        const errorText = await lpOptimizationResponse.text();
        console.error('LP Optimization API error response:', errorText);
        throw new Error(`LP Optimization API error! status: ${lpOptimizationResponse.status} - ${errorText}`);
      }

      const result: ApiResponse = await lpOptimizationResponse.json();
      console.log('LP Optimization API result:', result);
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        const scraped = result.data[0];
        const elements: ScrapedElement[] = [];
        let elementId = 1;

        // Process headlines
        scraped.headline.forEach((item, index) => {
          // Include items even if AI suggestions failed, but show original text
          const suggestions = item.ai_error === null ? item.ai_suggestions : [];
          elements.push({
            id: `headline-${elementId++}`,
            type: 'Headline',
            label: `Headline ${index + 1}`,
            originalText: item.original,
            importance: index === 0 ? 'high' : 'medium',
            suggestions: suggestions
          });
        });

        // Process subheadlines
        scraped.subheadline.forEach((item, index) => {
          const suggestions = item.ai_error === null ? item.ai_suggestions : [];
          elements.push({
            id: `subheadline-${elementId++}`,
            type: 'Subheadline',
            label: `Subheadline ${index + 1}`,
            originalText: item.original,
            importance: 'medium',
            suggestions: suggestions
          });
        });

        // Process call to actions
        scraped.call_to_action.forEach((item, index) => {
          const suggestions = item.ai_error === null ? item.ai_suggestions : [];
          elements.push({
            id: `cta-${elementId++}`,
            type: 'Call to Action',
            label: `CTA ${index + 1}`,
            originalText: item.original,
            importance: index < 3 ? 'high' : 'medium',
            suggestions: suggestions
          });
        });

        // Process descriptions/credibility
        scraped.description_credibility.forEach((item, index) => {
          const suggestions = item.ai_error === null ? item.ai_suggestions : [];
          elements.push({
            id: `description-${elementId++}`,
            type: 'Description',
            label: `Description ${index + 1}`,
            originalText: item.original,
            importance: 'low',
            suggestions: suggestions
          });
        });

        setScrapedData({
          url: normalizedUrl,
          title: scraped.headline[0]?.original || "Scraped Landing Page",
          totalElements: elements.length,
          elements: elements,
          html: undefined // Don't store HTML from /scrape API
        });

        // Initially set empty live preview - will be populated by complete scraper
        setLivePreviewHtml('');
        setCurrentBaseUrl(normalizedUrl);
        
        // Process complete HTML from second API if successful
        if (completeScraperResponse.ok) {
          try {
            const completeData: CompleteScraperResponse = await completeScraperResponse.json();
            console.log('Complete Scraper API result:', completeData);
            if (completeData.status === 'success' && completeData.data && completeData.data.length > 0) {
              const completeResult = completeData.data[0];
              if (completeResult.success && completeResult.complete_html) {
                console.log('Setting complete HTML - length:', completeResult.complete_html.length);
                setCompleteHtml(completeResult.complete_html);
                setLivePreviewHtml(completeResult.complete_html); // Use ONLY complete HTML for live preview
                console.log('Complete HTML with CSS loaded successfully');
                console.log('CSS files processed:', completeResult.css_files_processed);
              } else {
                console.warn('Complete scraper succeeded but no valid HTML returned');
                setLivePreviewHtml(''); // No HTML available for live preview
              }
            } else {
              console.warn('Complete scraper API returned no data');
              setLivePreviewHtml(''); // No HTML available for live preview
            }
          } catch (completeError) {
            console.warn('Failed to parse complete scraper response:', completeError);
            setLivePreviewHtml(''); // No HTML available for live preview
          }
        } else {
          console.warn('Complete scraper API failed with status:', completeScraperResponse.status);
          setLivePreviewHtml(''); // No HTML available for live preview
        }
        
        // Trigger sidebar toggle to enter live preview mode
        if (onToggleSidebar) {
          onToggleSidebar();
        }

        // Notify parent that analyze was clicked
        if (onAnalyze) {
          onAnalyze();
        }
      } else {
        throw new Error('No data received from LP optimization API or invalid response structure');
      }
    } catch (error) {
      console.error('Error scraping data:', error);
      
      // Provide more specific error messaging
      let errorMessage = 'Failed to scrape the URL. ';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += 'Network error - please check your internet connection and try again.';
      } else if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage += 'CORS error - the API may need to allow requests from this domain.';
        } else if (error.message.includes('429')) {
          errorMessage += 'Rate limit exceeded - please wait a moment and try again.';
        } else if (error.message.includes('404')) {
          errorMessage += 'API endpoint not found - please check the API configuration.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      // Fallback to show error message or empty state
      setScrapedData(null);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    console.log('Saving optimizations...');
  };

  const handlePreview = () => {
    if (!scrapedData) return;
    
    // Update the modified HTML with all saved changes
    const updatedHtml = updateModifiedHtml();
    setModifiedHtml(updatedHtml);
    
    // Show full-screen preview dialog
    setShowFullScreenPreview(true);
  };

  const handleElementSelectionChange = (elementSelections: Map<string, string>) => {
    setSelectedElementsCount(elementSelections.size);
  };

  const handleElementSave = (elementId: string, originalText: string, newText: string) => {
    // Add to saved changes
    const newSavedChanges = new Map(savedChanges);
    newSavedChanges.set(elementId, { original: originalText, modified: newText });
    setSavedChanges(newSavedChanges);

    // Update live preview HTML immediately
    updateLivePreview(newSavedChanges);

    // Update modified HTML immediately
    if (scrapedData?.html) {
      let updatedHtml = modifiedHtml || scrapedData.html;
      
      // Apply this specific change
      updatedHtml = updatedHtml.replace(
        new RegExp(originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newText
      );
      
      setModifiedHtml(updatedHtml);
    }
  };

  const updateLivePreview = (changesMap: Map<string, { original: string, modified: string }>) => {
    // Use ONLY complete HTML from /scrape-complete API, ignore HTML from /scrape API
    if (!completeHtml) {
      console.warn('No complete HTML available for live preview updates');
      return;
    }
    
    let updatedHtml = completeHtml;
    
    // Apply all changes to the complete HTML
    changesMap.forEach((change) => {
      updatedHtml = updatedHtml.replace(
        new RegExp(change.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        change.modified
      );
    });
    
    setLivePreviewHtml(updatedHtml);
  };

  const updateModifiedHtml = () => {
    // Use ONLY complete HTML from /scrape-complete API
    console.log('updateModifiedHtml called');
    console.log('completeHtml available:', !!completeHtml);
    console.log('completeHtml length:', completeHtml?.length || 0);
    console.log('savedChanges count:', savedChanges.size);
    
    if (!completeHtml) {
      console.log('No complete HTML available');
      return '';
    }
    
    let newHtml = completeHtml;
    
    // Apply all saved changes
    savedChanges.forEach((change) => {
      console.log('Applying change:', change.original, '->', change.modified);
      newHtml = newHtml.replace(
        new RegExp(change.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        change.modified
      );
    });
    
    console.log('Final HTML length:', newHtml.length);
    return newHtml;
  };

  return (
    <div className={`${isLivePreviewOpen ? 'h-screen flex' : 'min-h-screen'}`}>
      {/* Main Content Area - Scrollable */}
      <div className={`${isLivePreviewOpen ? 'w-[40%] flex-shrink-0 overflow-y-auto' : 'w-full'} bg-gradient-to-br from-background via-blue-50/30 to-emerald-50/30 dark:from-background dark:via-background dark:to-background`}>
        <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-chart-1/10 px-4 py-2 rounded-full border border-chart-1/20">
              <Sparkles className="w-4 h-4 text-chart-1" />
              <span className="text-sm font-medium text-chart-1">AI-Powered Optimization</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
                Landing Page Optimization Tool
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Analyze any landing page and get intelligent AI suggestions to improve conversion rates, 
                user engagement, and overall performance across all content elements.
              </p>
            </div>
          </div>

          {/* Enhanced URL Input Section */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">Start Your Optimization</h2>
                <p className="text-muted-foreground">Enter your landing page URL to begin AI-powered analysis</p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <label htmlFor="url" className="block text-sm font-medium text-foreground mb-3">
                  Landing Page URL
                </label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://your-landing-page.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 px-4 text-base border-border focus:border-chart-1 focus:ring-chart-1/20 bg-input-background text-foreground"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleScrapeData}
                    disabled={!url.trim() || isLoading}
                    className="h-12 bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white px-8 shadow-lg shadow-chart-1/25 min-w-[160px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5" />
                        <span>Analyze Page</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {scrapedData && (
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-chart-2" />
                    <span>{scrapedData.totalElements} elements detected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-chart-1 rounded-full"></span>
                    <span>{selectedElementsCount} optimizations selected</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Scraped Data Display */}
          {scrapedData && (
            <ScrapedDataSection 
              data={scrapedData} 
              onSelectionChange={setSelectedElementsCount}
              onElementSelectionChange={handleElementSelectionChange}
              onElementSave={handleElementSave}
            />
          )}

          {/* Enhanced Action Buttons */}
          {scrapedData && (
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to optimize?</h3>
                  <p className="text-muted-foreground">Save your optimizations or preview the changes</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="flex-1 sm:flex-none h-12 border-border hover:bg-accent hover:border-accent px-8 text-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Optimizations
                  </Button>
                  <Button
                    onClick={handlePreview}
                    className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-chart-2 to-chart-3 hover:from-chart-2/90 hover:to-chart-3/90 text-white px-8 shadow-lg shadow-chart-2/25"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* HTML Source Code Display when live preview is not active */}
          {scrapedData && completeHtml && !isLivePreviewOpen && (
            <div className="bg-card rounded-2xl border border-border shadow-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chart-3/10 rounded-lg">
                      <Code className="w-5 h-5 text-chart-3" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">HTML Source Comparison</h3>
                      <p className="text-sm text-muted-foreground">
                        {savedChanges.size > 0 
                          ? `Compare original HTML with your ${savedChanges.size} optimization${savedChanges.size > 1 ? 's' : ''}` 
                          : 'Original HTML code from the scraped page'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowHtml(!showHtml)}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent"
                  >
                    {showHtml ? 'Hide' : 'Show'} HTML
                  </Button>
                </div>
              </div>
              
              {showHtml && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original HTML */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Original HTML</h4>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(scrapedData.html || '');
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted rounded-lg border border-border">
                        <div className="p-4 max-h-96 overflow-y-auto">
                          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                            {scrapedData.html}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Modified HTML */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {savedChanges.size > 0 ? 'Optimized HTML' : 'Original HTML'}
                        </h4>
                        <Button
                          onClick={() => {
                            const htmlToShow = updateModifiedHtml(); // Use complete HTML with changes
                            navigator.clipboard.writeText(htmlToShow);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted rounded-lg border border-border">
                        <div className="p-4 max-h-96 overflow-y-auto">
                          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                            {updateModifiedHtml() || 'Complete HTML will appear here after successful scraping...'}
                          </pre>
                        </div>
                      </div>
                      {savedChanges.size > 0 && (
                        <div className="text-xs text-chart-1 bg-chart-1/10 px-3 py-2 rounded-lg">
                          ✨ This HTML includes {savedChanges.size} optimization{savedChanges.size > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      {isLivePreviewOpen && scrapedData && (
        <div className="w-[60%] flex-shrink-0 bg-muted/30 border-l border-border">
          <div className="h-screen p-4">
            {livePreviewHtml ? (
              <LivePreview
                originalHtml={completeHtml || ''} // Use complete HTML as original
                modifiedHtml={livePreviewHtml} // This will be the complete HTML with user changes
                baseUrl={currentBaseUrl}
                className="h-full"
                showBothViews={false}
                savedChanges={savedChanges}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Loading complete website preview...</p>
                  <p className="text-sm mt-2">Waiting for complete HTML with CSS</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Preview Dialog */}
      <FullScreenPreviewDialog
        isOpen={showFullScreenPreview}
        onClose={() => setShowFullScreenPreview(false)}
        originalHtml={completeHtml || ''} // Use complete HTML
        modifiedHtml={updateModifiedHtml()} // Use complete HTML with changes
        baseUrl={scrapedData?.url}
      />
    </div>
  );
}