import { useEffect, useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

type ViewportType = 'desktop' | 'tablet' | 'phone';

interface LivePreviewProps {
  originalHtml: string;
  modifiedHtml: string;
  baseUrl?: string;
  className?: string;
  showBothViews?: boolean;
  savedChanges?: Map<string, { original: string, modified: string }>;
}

export function LivePreview({ 
  originalHtml, 
  modifiedHtml, 
  baseUrl, 
  className = '',
  showBothViews = true,
  savedChanges 
}: LivePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [currentViewport, setCurrentViewport] = useState<ViewportType>('desktop');
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  // Convert savedChanges Map to array for easier processing
  const textChanges = savedChanges ? Array.from(savedChanges.values()) : [];

  // Apply text changes to iframe content via JavaScript injection
  useEffect(() => {
    if (iframeRef && textChanges.length > 0) {
      // For cross-origin iframes, we can't inject scripts
      // So let's go back to using srcDoc with the modified HTML
      console.log('Text changes to apply:', textChanges);
    }
  }, [iframeRef, textChanges]);

  // Create iframe content with proper CSS loading and text changes applied
  const createOptimizedContent = () => {
    if (!baseUrl || textChanges.length === 0) {
      return null; // Load original website directly
    }

    // Apply text changes to the HTML content
    let modifiedContent = originalHtml;
    
    textChanges.forEach(change => {
      const regex = new RegExp(change.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      modifiedContent = modifiedContent.replace(regex, change.modified);
    });

    // Fix CSS URLs to absolute paths
    const baseDomain = new URL(baseUrl).origin;
    
    // Fix CSS links
    modifiedContent = modifiedContent.replace(
      /href=["']([^"']*\.css[^"']*?)["']/gi,
      (match, href) => {
        if (href.startsWith('http') || href.startsWith('//')) return match;
        if (href.startsWith('/')) return `href="${baseDomain}${href}"`;
        return `href="${baseDomain}/${href.replace(/^\//, '')}"`;
      }
    );

    // Fix JS files
    modifiedContent = modifiedContent.replace(
      /src=["']([^"']*\.js[^"']*?)["']/gi,
      (match, src) => {
        if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return match;
        if (src.startsWith('/')) return `src="${baseDomain}${src}"`;
        return `src="${baseDomain}/${src.replace(/^\//, '')}"`;
      }
    );

    // Fix image sources
    modifiedContent = modifiedContent.replace(
      /src=["']([^"']*\.(jpg|jpeg|png|gif|webp|svg|ico)[^"']*?)["']/gi,
      (match, src) => {
        if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return match;
        if (src.startsWith('/')) return `src="${baseDomain}${src}"`;
        return `src="${baseDomain}/${src.replace(/^\//, '')}"`;
      }
    );

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <base href="${baseDomain}/">
</head>
<body>
${modifiedContent}
<script>
// Handle lazy loaded images
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = document.querySelectorAll('img[data-src], img[data-original], img[data-lazy-src]');
  lazyImages.forEach(function(img) {
    const src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy-src');
    if (src) {
      img.src = src;
    }
  });
});
</script>
</body>
</html>`;
  };

  // Handle iframe load
  const handleIframeLoad = (iframe: HTMLIFrameElement) => {
    setIframeRef(iframe);
  };

  // Force iframe refresh when base URL changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [baseUrl]);

  // Viewport configurations
  const viewportConfig = {
    desktop: { width: '1440px', height: '900px', label: 'Desktop' },
    tablet: { width: '670px', height: '1024px', label: 'Tablet' },
    phone: { width: '375px', height: '667px', label: 'Phone' }
  };

  if (showBothViews) {
    return (
      <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
        {/* Browser-style Header */}
        <div className="bg-muted/30 p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground ml-2">Live Preview</span>
          </div>
        </div>

        {/* Split View Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
          {/* Original Preview */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="bg-chart-1/10 border border-chart-1/30 rounded-xl px-4 py-1.5">
                <h3 className="font-semibold text-chart-1 text-xs">Original</h3>
              </div>
            </div>
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden flex-1 shadow-lg min-h-0 border border-border">
              <iframe
                key={`original-${iframeKey}`}
                src={baseUrl}
                className="w-full h-full border-0"
                style={{ minHeight: '500px' }}
                title="Original Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              />
            </div>
          </div>

          {/* Modified Preview */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="bg-chart-2/10 border border-chart-2/30 rounded-xl px-4 py-1.5">
                <h3 className="font-semibold text-chart-2 text-xs">Optimized</h3>
              </div>
            </div>
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden flex-1 shadow-lg min-h-0 border border-border">
              <iframe
                key={`modified-${iframeKey}`}
                src={textChanges.length === 0 ? baseUrl : undefined}
                srcDoc={textChanges.length > 0 ? (createOptimizedContent() || undefined) : undefined}
                className="w-full h-full border-0"
                style={{ minHeight: '500px' }}
                title="Modified Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                ref={handleIframeLoad}
                onLoad={(e) => handleIframeLoad(e.currentTarget)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single view mode (shows only modified content)
  return (
    <div className={`bg-background border border-border rounded-lg overflow-hidden flex flex-col ${className}`}>
      {/* Browser-style Header with Viewport Controls */}
      <div className="bg-muted/30 p-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground ml-2">Live Preview</span>
          </div>
          
          {/* Viewport Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentViewport === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setCurrentViewport('desktop')}
              className="h-7 px-2 text-xs"
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={currentViewport === 'tablet' ? 'default' : 'ghost'}
              onClick={() => setCurrentViewport('tablet')}
              className="h-7 px-2 text-xs"
              title="Tablet View"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={currentViewport === 'phone' ? 'default' : 'ghost'}
              onClick={() => setCurrentViewport('phone')}
              className="h-7 px-2 text-xs"
              title="Phone View"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Responsive Preview Container */}
      {currentViewport === 'desktop' ? (
        // Desktop: Large device frame
        <div className="flex-1 flex items-center justify-center bg-muted/10 overflow-hidden">
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: viewportConfig[currentViewport].width,
              height: viewportConfig[currentViewport].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              key={`${currentViewport}-${iframeKey}`}
              src={textChanges.length === 0 ? baseUrl : undefined}
              srcDoc={textChanges.length > 0 ? (createOptimizedContent() || undefined) : undefined}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              loading="lazy"
              title="Desktop Preview"
              ref={handleIframeLoad}
              onLoad={(e) => handleIframeLoad(e.currentTarget)}
            />
          </div>
        </div>
      ) : (
        // Tablet/Phone: Centered device frame without extra padding
        <div className="flex-1 flex items-center justify-center bg-muted/10 overflow-hidden">
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: viewportConfig[currentViewport].width,
              height: viewportConfig[currentViewport].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              key={`${currentViewport}-${iframeKey}`}
              src={textChanges.length === 0 ? baseUrl : undefined}
              srcDoc={textChanges.length > 0 ? (createOptimizedContent() || undefined) : undefined}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              loading="lazy"
              title={`${viewportConfig[currentViewport].label} Preview`}
              ref={handleIframeLoad}
              onLoad={(e) => handleIframeLoad(e.currentTarget)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
