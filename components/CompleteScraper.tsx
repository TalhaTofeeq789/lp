import { useState } from 'react';
import { Download, Globe, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface ScrapedResult {
  url: string;
  complete_html: string;
  css_files_processed: number;
  success: boolean;
}

interface ApiResponse {
  status: string;
  data: ScrapedResult[];
  scraping_type: string;
  processing_info: {
    total_urls: number;
    includes: string[];
    note: string;
  };
}

export function CompleteScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to normalize URL
  const normalizeUrl = (inputUrl: string) => {
    let normalizedUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  const handleScrapeComplete = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      const response = await fetch('https://web-scraper-backend-kappa.vercel.app/scrape-complete', {
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
        setResults(result.data);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error scraping website:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape the website');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadHtml = (html: string, url: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Create filename from URL
    const domain = new URL(url).hostname.replace('www.', '');
    link.download = `${domain}-complete.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const previewHtml = (html: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-emerald-50/30 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-chart-2/10 px-4 py-2 rounded-full border border-chart-2/20">
            <Globe className="w-4 h-4 text-chart-2" />
            <span className="text-sm font-medium text-chart-2">Complete Website Scraper</span>
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              HTML + CSS Complete Scraper
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Download complete websites with all CSS embedded inline. Perfect for saving websites locally 
              with 100% original styling preserved.
            </p>
          </div>
        </div>

        {/* URL Input Section */}
        <Card className="p-8 shadow-lg backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-chart-2" />
              <h2 className="text-xl font-semibold">Scrape Complete Website</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="website-url" className="block text-sm font-medium text-foreground mb-2">
                  Website URL
                </label>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleScrapeComplete()}
                />
              </div>
              
              <Button 
                onClick={handleScrapeComplete}
                disabled={!url.trim() || isLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping Website...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Scrape Complete Website
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Scraping Failed</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Scraping Results</h2>
            
            {results.map((result, index) => (
              <Card key={index} className="p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <h3 className="text-lg font-semibold">{result.url}</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{result.css_files_processed} CSS files processed</span>
                        <span>•</span>
                        <span>{Math.round(result.complete_html.length / 1024)} KB</span>
                      </div>
                    </div>
                  </div>

                  {result.success && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => downloadHtml(result.complete_html, result.url)}
                        variant="default"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download HTML
                      </Button>
                      
                      <Button
                        onClick={() => previewHtml(result.complete_html)}
                        variant="outline"
                        size="sm"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Features Info */}
        <Card className="p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-4">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Complete HTML structure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>All CSS embedded inline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>External stylesheets processed</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Absolute URLs for resources</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Original styling preserved</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Offline-ready HTML files</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
