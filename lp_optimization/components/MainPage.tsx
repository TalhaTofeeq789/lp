import { useState } from 'react';
import { Brain, Save, Eye, Sparkles, Zap, Code, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrapedDataSection } from './ScrapedDataSection';
import { FullScreenPreviewDialog } from './FullScreenPreviewDialog';

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

export function MainPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [selectedElementsCount, setSelectedElementsCount] = useState(0);
  const [showHtml, setShowHtml] = useState(false);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [modifiedHtml, setModifiedHtml] = useState('');
  const [savedChanges, setSavedChanges] = useState<Map<string, { original: string, modified: string }>>(new Map());

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
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://web-scraper-backend-kappa.vercel.app';
      const response = await fetch(`${apiUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: [normalizedUrl]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        const scraped = result.data[0];
        const elements: ScrapedElement[] = [];
        let elementId = 1;

        // Process headlines
        scraped.headline.forEach((item, index) => {
          if (item.ai_error === null && item.ai_suggestions.length > 0) {
            elements.push({
              id: `headline-${elementId++}`,
              type: 'Headline',
              label: `Headline ${index + 1}`,
              originalText: item.original,
              importance: index === 0 ? 'high' : 'medium',
              suggestions: item.ai_suggestions
            });
          }
        });

        // Process subheadlines
        scraped.subheadline.forEach((item, index) => {
          if (item.ai_error === null && item.ai_suggestions.length > 0) {
            elements.push({
              id: `subheadline-${elementId++}`,
              type: 'Subheadline',
              label: `Subheadline ${index + 1}`,
              originalText: item.original,
              importance: 'medium',
              suggestions: item.ai_suggestions
            });
          }
        });

        // Process call to actions
        scraped.call_to_action.forEach((item, index) => {
          if (item.ai_error === null && item.ai_suggestions.length > 0) {
            elements.push({
              id: `cta-${elementId++}`,
              type: 'Call to Action',
              label: `CTA ${index + 1}`,
              originalText: item.original,
              importance: index < 3 ? 'high' : 'medium',
              suggestions: item.ai_suggestions
            });
          }
        });

        // Process descriptions/credibility
        scraped.description_credibility.forEach((item, index) => {
          if (item.ai_error === null && item.ai_suggestions.length > 0) {
            elements.push({
              id: `description-${elementId++}`,
              type: 'Description',
              label: `Description ${index + 1}`,
              originalText: item.original,
              importance: 'low',
              suggestions: item.ai_suggestions
            });
          }
        });

        setScrapedData({
          url: normalizedUrl,
          title: scraped.headline[0]?.original || "Scraped Landing Page",
          totalElements: elements.length,
          elements: elements,
          html: scraped.html
        });
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error scraping data:', error);
      // Fallback to show error message or empty state
      setScrapedData(null);
      alert('Failed to scrape the URL. Please check the URL and try again.');
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

  const updateModifiedHtml = () => {
    if (!scrapedData?.html) return '';
    
    let newHtml = scrapedData.html;
    
    // Apply all saved changes
    savedChanges.forEach((change) => {
      newHtml = newHtml.replace(
        new RegExp(change.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        change.modified
      );
    });
    
    return newHtml;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-emerald-50/30 dark:from-background dark:via-background dark:to-background">
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

        {/* Full-Screen Preview Dialog */}
        <FullScreenPreviewDialog
          isOpen={showFullScreenPreview}
          onClose={() => setShowFullScreenPreview(false)}
          originalHtml={scrapedData?.html || ''}
          modifiedHtml={modifiedHtml || scrapedData?.html || ''}
          baseUrl={scrapedData?.url}
        />

        {/* HTML Source Code Display - Original and Modified */}
        {scrapedData && scrapedData.html && (
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
                          const htmlToShow = modifiedHtml || scrapedData.html || '';
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
                          {modifiedHtml || scrapedData.html}
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
  );
}