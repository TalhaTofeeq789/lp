import { useState } from 'react';
import { Brain, Save, Eye, Sparkles, Zap, Code } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrapedDataSection } from './ScrapedDataSection';

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

interface ApiResponse {
  data: Array<{
    call_to_action: string[];
    description_credibility: string[];
    headline: string[];
    html: string;
    subheadline: string[];
  }>;
  status: string;
}

export function MainPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [selectedElementsCount, setSelectedElementsCount] = useState(0);
  const [showHtml, setShowHtml] = useState(false);

  // Helper function to normalize URL
  const normalizeUrl = (inputUrl: string) => {
    let normalizedUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  // Helper function to generate AI suggestions for text
  const generateSuggestions = (originalText: string, type: string): string[] => {
    const suggestions: string[] = [];
    
    if (type.toLowerCase().includes('headline')) {
      suggestions.push(
        `${originalText} - Enhanced`,
        `Discover ${originalText}`,
        `Premium ${originalText}`,
        `Ultimate ${originalText}`
      );
    } else if (type.toLowerCase().includes('cta') || type.toLowerCase().includes('call_to_action')) {
      suggestions.push(
        `${originalText} Now`,
        `Get ${originalText}`,
        `Start ${originalText}`,
        `Try ${originalText} Free`
      );
    } else {
      suggestions.push(
        `${originalText} - Optimized`,
        `Enhanced: ${originalText}`,
        `Premium ${originalText}`,
        `${originalText} Plus`
      );
    }
    
    return suggestions.slice(0, 4);
  };

  const handleScrapeData = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      const response = await fetch('https://web-scraper-backend-kappa.vercel.app/scrape-batch', {
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
        scraped.headline.forEach((headline, index) => {
          elements.push({
            id: `headline-${elementId++}`,
            type: 'Headline',
            label: `Headline ${index + 1}`,
            originalText: headline,
            importance: index === 0 ? 'high' : 'medium',
            suggestions: generateSuggestions(headline, 'headline')
          });
        });

        // Process subheadlines
        scraped.subheadline.forEach((subheadline, index) => {
          elements.push({
            id: `subheadline-${elementId++}`,
            type: 'Subheadline',
            label: `Subheadline ${index + 1}`,
            originalText: subheadline,
            importance: 'medium',
            suggestions: generateSuggestions(subheadline, 'subheadline')
          });
        });

        // Process call to actions
        scraped.call_to_action.forEach((cta, index) => {
          elements.push({
            id: `cta-${elementId++}`,
            type: 'Call to Action',
            label: `CTA ${index + 1}`,
            originalText: cta,
            importance: index < 3 ? 'high' : 'medium',
            suggestions: generateSuggestions(cta, 'call_to_action')
          });
        });

        // Process descriptions/credibility
        scraped.description_credibility.forEach((desc, index) => {
          elements.push({
            id: `description-${elementId++}`,
            type: 'Description',
            label: `Description ${index + 1}`,
            originalText: desc,
            importance: 'low',
            suggestions: generateSuggestions(desc, 'description')
          });
        });

        setScrapedData({
          url: normalizedUrl,
          title: scraped.headline[0] || "Scraped Landing Page",
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
    console.log('Opening preview...');
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

        {/* HTML Source Code Display */}
        {scrapedData && scrapedData.html && (
          <div className="bg-card rounded-2xl border border-border shadow-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/10 rounded-lg">
                    <Code className="w-5 h-5 text-chart-3" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Complete HTML Source</h3>
                    <p className="text-sm text-muted-foreground">Original HTML code from the scraped page</p>
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
                <div className="bg-muted rounded-lg border border-border">
                  <div className="p-4 border-b border-border bg-muted-foreground/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">HTML Source Code</span>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(scrapedData.html || '');
                          // You could add a toast notification here
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                      {scrapedData.html}
                    </pre>
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