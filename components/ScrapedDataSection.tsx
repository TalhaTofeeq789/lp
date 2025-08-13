import { useState } from 'react';
import { DropdownSection } from './DropdownSection';
import { Badge } from './ui/badge';
import { Target, Search } from 'lucide-react';
import { Input } from './ui/input';

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
}

interface ScrapedDataSectionProps {
  data: ScrapedData;
  onSelectionChange: (count: number) => void;
  onElementSelectionChange?: (elementSelections: Map<string, string>) => void;
  onElementSave?: (elementId: string, originalText: string, newText: string) => void;
}

export function ScrapedDataSection({ data, onSelectionChange, onElementSelectionChange, onElementSave }: ScrapedDataSectionProps) {
  const [selectedElements, setSelectedElements] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleElementSelection = (elementId: string, selectedText: string | null) => {
    const newSelected = new Map(selectedElements);
    if (selectedText) {
      newSelected.set(elementId, selectedText);
    } else {
      newSelected.delete(elementId);
    }
    setSelectedElements(newSelected);
    onSelectionChange(newSelected.size);
    
    // Call the new callback if provided
    if (onElementSelectionChange) {
      onElementSelectionChange(newSelected);
    }
  };

  const handleDropdownToggle = (elementId: string, isOpen: boolean) => {
    setOpenDropdownId(isOpen ? elementId : null);
  };

  // Helper function to safely format URL display
  const formatUrlForDisplay = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const hostname = cleanUrl.split('/')[0];
      return hostname || url;
    }
  };

  // Filter elements based on search query
  const filteredElements = data.elements.filter(element => 
    element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.originalText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 border-b border-border p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Content Analysis & AI Suggestions
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              We've analyzed your landing page and identified key elements that can be optimized. 
              Click on any suggestion or select the original content to include it in your optimization.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-card rounded-lg px-4 py-2 shadow-sm border border-border">
              <div className="text-sm text-muted-foreground">Page analyzed</div>
              <div className="font-medium text-foreground truncate max-w-xs">
                {formatUrlForDisplay(data.url)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input-background border-border focus:border-chart-1 focus:ring-chart-1/20"
            />
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1 border-border text-foreground">
              {filteredElements.length} elements found
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-chart-1/30 bg-chart-1/10 text-chart-1">
              {selectedElements.size} selected
            </Badge>
          </div>
        </div>

        {/* All Elements */}
        <div className="space-y-4">
          {filteredElements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No elements found</div>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            filteredElements.map((element) => (
              <DropdownSection
                key={element.id}
                element={element}
                onSelectionChange={handleElementSelection}
                onElementSave={onElementSave}
                isOpen={openDropdownId === element.id}
                onToggle={(isOpen) => handleDropdownToggle(element.id, isOpen)}
              />
            ))
          )}
        </div>

        {/* Summary */}
        {selectedElements.size > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-xl border border-chart-1/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {selectedElements.size} Optimization{selectedElements.size !== 1 ? 's' : ''} Selected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ready to implement these improvements to your landing page
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-chart-1 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}