import { useEffect, useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewProps {
  htmlContent?: string;
  baseUrl?: string;
  url?: string;
  className?: string;
}

export function LivePreview({ htmlContent, baseUrl, url, className = '' }: LivePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');

  // Force iframe refresh when content changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [htmlContent, url]);

  const getViewportDimensions = (size: ViewportSize) => {
    switch (size) {
      case 'mobile':
        return { width: '375px', height: '100%', label: '375px' };
      case 'tablet':
        return { width: '768px', height: '100%', label: '768px' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%', label: 'Full Width' };
    }
  };

  const dimensions = getViewportDimensions(viewportSize);

  // If we have a URL, use that directly for the original working behavior
  if (url) {
    return (
      <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="bg-muted/30 p-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground ml-2">Live Preview</span>
              <span className="text-xs text-muted-foreground ml-2">{url}</span>
              <span className="text-xs text-muted-foreground ml-2">•</span>
              <span className="text-xs font-medium text-foreground">{dimensions.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('desktop')}
                className="h-7 w-7 p-0"
                title="Desktop View"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('tablet')}
                className="h-7 w-7 p-0"
                title="Tablet View"
              >
                <Tablet className="h-3 w-3" />
              </Button>
              <Button
                variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('mobile')}
                className="h-7 w-7 p-0"
                title="Mobile View"
              >
                <Smartphone className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full overflow-hidden flex justify-center" style={{ height: 'calc(100vh - 120px)' }}>
          <div 
            className="transition-all duration-300 ease-in-out border-l border-r border-border bg-white"
            style={{ 
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100%',
              boxShadow: viewportSize !== 'desktop' ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <iframe
              key={iframeKey}
              src={url}
              className="w-full h-full border-0"
              style={{ 
                overflow: 'hidden'
              }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to HTML content approach
  const completeHtml = htmlContent && htmlContent.includes('<!DOCTYPE') ? 
    htmlContent : 
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Live Preview</title>
      ${baseUrl ? `<base href="${baseUrl}">` : ''}
    </head>
    <body>
      ${htmlContent || '<p>No content to preview</p>'}
    </body>
    </html>`;

  return (
    <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="bg-muted/30 p-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground ml-2">Live Preview</span>
            <span className="text-xs text-muted-foreground ml-2">•</span>
            <span className="text-xs font-medium text-foreground">{dimensions.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('desktop')}
              className="h-7 w-7 p-0"
              title="Desktop View"
            >
              <Monitor className="h-3 w-3" />
            </Button>
            <Button
              variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('tablet')}
              className="h-7 w-7 p-0"
              title="Tablet View"
            >
              <Tablet className="h-3 w-3" />
            </Button>
            <Button
              variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('mobile')}
              className="h-7 w-7 p-0"
              title="Mobile View"
            >
              <Smartphone className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full overflow-hidden flex justify-center" style={{ height: 'calc(100vh - 120px)' }}>
        <div 
          className="transition-all duration-300 ease-in-out border-l border-r border-border bg-white"
          style={{ 
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
            boxShadow: viewportSize !== 'desktop' ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <iframe
            key={iframeKey}
            srcDoc={completeHtml}
            className="w-full h-full border-0"
            style={{ 
              overflow: 'auto'
            }}
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
