import { X } from 'lucide-react';
import { Button } from './ui/button';

interface FullScreenPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalHtml: string;
  modifiedHtml: string;
  baseUrl?: string;
}

export function FullScreenPreviewDialog({ 
  isOpen, 
  onClose, 
  originalHtml, 
  modifiedHtml,
  baseUrl
}: FullScreenPreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-500">
      {/* Blurred Background - Follows Theme */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      {/* Clean Modern Dialog - Theme Aware */}
      <div className="relative bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl w-[95vw] h-[95vh] animate-in zoom-in-95 duration-500 flex flex-col overflow-hidden border border-border">
        {/* Compact Header */}
        <div className="px-4 py-2 border-b border-border bg-card/90 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-primary">Live Preview</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-7 w-7 p-0 transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Clean Content Area - No Background */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Original Preview */}
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="bg-chart-1/10 border border-chart-1/30 rounded-xl px-4 py-1.5">
                  <h3 className="font-semibold text-chart-1 text-xs">Original</h3>
                </div>
              </div>
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden flex-1 shadow-lg min-h-0 border border-border">
                <iframe
                  srcDoc={`<!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseUrl ? `<base href="${baseUrl}" target="_blank">` : ''}
                        <style>
                          html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                          }
                        </style>
                      </head>
                      <body>
                        ${originalHtml}
                      </body>
                    </html>`}
                  className="w-full h-full border-0"
                  title="Original Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
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
                  srcDoc={`<!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseUrl ? `<base href="${baseUrl}" target="_blank">` : ''}
                        <style>
                          html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                          }
                        </style>
                      </head>
                      <body>
                        ${modifiedHtml}
                      </body>
                    </html>`}
                  className="w-full h-full border-0"
                  title="Modified Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
