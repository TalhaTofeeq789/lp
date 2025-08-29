import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Edit3, Plus, RefreshCw, Copy, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Input } from './ui/input';

interface ScrapedElement {
  id: string;
  type: string;
  label: string;
  originalText: string;
  importance: 'high' | 'medium' | 'low';
  suggestions: string[];
}

interface DropdownSectionProps {
  element: ScrapedElement;
  onSelectionChange: (elementId: string, selectedText: string | null) => void;
  onElementSave?: (elementId: string, originalText: string, newText: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function DropdownSection({ 
  element, 
  onSelectionChange,
  onElementSave,
  isOpen: externalIsOpen,
  onToggle
}: DropdownSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(() => 
    element.suggestions.map(suggestion => 
      suggestion.replace(/^["']|["']$/g, '') // Remove leading and trailing quotes
    )
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      // Use external state management
      onToggle(!isOpen);
    } else {
      // Use internal state management
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    
    // Simulate API call for generating more suggestions
    setTimeout(() => {
      const newSuggestions = [
        "Enhanced version with improved clarity and impact",
        "Optimized for better conversion and engagement",
        "Modern approach with compelling user-focused language"
      ];
      
      setSuggestions(prev => [...prev, ...newSuggestions]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSelectOption = (text: string) => {
    const newSelectedText = selectedText === text ? null : text;
    setSelectedText(newSelectedText);
    onSelectionChange(element.id, newSelectedText);
    
    // Automatically save the change when an option is selected
    if (newSelectedText && onElementSave) {
      onElementSave(element.id, element.originalText, newSelectedText);
    }
  };

  const handleSelectOriginal = () => {
    const newSelectedText = selectedText === element.originalText ? null : element.originalText;
    setSelectedText(newSelectedText);
    onSelectionChange(element.id, newSelectedText);
    
    // Automatically save the change when original is selected
    if (newSelectedText && onElementSave) {
      onElementSave(element.id, element.originalText, newSelectedText);
    }
  };

  const handleCopyText = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (typeof index === 'number') {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Clear after 2 seconds
    }
  };

  const handleEditText = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index] = editingText;
    setSuggestions(newSuggestions);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const isSelected = selectedText !== null;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
      isSelected ? 'ring-2 ring-chart-1 border-chart-1/50 bg-chart-1/5' : 'border-border bg-card'
    }`}>
      {/* Dropdown Header */}
      <div className="bg-card backdrop-blur-sm">
        <div className="flex items-center justify-between p-5">
          <button
            onClick={handleToggle}
            className="flex items-center gap-4 text-left flex-1 hover:bg-accent/50 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{element.label}</h3>
                  <Badge className="text-xs px-2 py-1 bg-chart-2/20 text-chart-2 border-chart-2/30">
                    {element.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedText || element.originalText}
                </p>
              </div>
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            {isSelected && (
              <div className="flex items-center gap-2 text-chart-1 text-sm">
                <Check className="w-4 h-4" />
                <span>Selected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-6 bg-card border-t border-border space-y-6">
          {/* Original Text Option */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span>Original Content</span>
              <Badge variant="outline" className="text-xs border-border">
                Current
              </Badge>
            </h4>
            <Card 
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md group border-border bg-card ${
                selectedText === element.originalText
                  ? 'ring-2 ring-chart-1 bg-chart-1/10 border-chart-1/50 shadow-md' 
                  : 'hover:border-accent hover:bg-accent/30'
              }`}
              onClick={handleSelectOriginal}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-foreground flex-1 leading-relaxed">{element.originalText}</p>
                <div className="flex items-center gap-2">
                  {selectedText === element.originalText ? (
                    <div className="w-6 h-6 bg-chart-1 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(element.originalText, -1);
                            }}
                            className="h-6 w-6 p-0 hover:bg-accent text-foreground"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedIndex === -1 && (
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                                Copied!
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy text</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-accent text-foreground"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit original</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedText === element.originalText && (
                <div className="mt-3 pt-3 border-t border-chart-1/30">
                  <div className="flex items-center gap-2 text-sm text-chart-1">
                    <Check className="w-4 h-4" />
                    <span>Original content selected</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* AI Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-chart-1" />
              <h4 className="font-medium text-foreground">AI-Generated Alternatives</h4>
              <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30 text-xs">
                {suggestions.length} options
              </Badge>
            </div>
            
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <Card className="p-4 border-border bg-card/50">
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">AI suggestions temporarily unavailable</p>
                    <p className="text-xs mt-1">You can still use the original content or add custom alternatives</p>
                  </div>
                </Card>
              ) : (
                suggestions.map((suggestion, index) => (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md group border-border bg-card ${
                    selectedText === suggestion
                      ? 'ring-2 ring-chart-1 bg-chart-1/10 border-chart-1/50 shadow-md' 
                      : 'hover:border-accent hover:bg-accent/30'
                  }`}
                  onClick={() => editingIndex !== index && handleSelectOption(suggestion)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {editingIndex === index ? (
                      <div className="flex-1 space-y-3">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-foreground bg-background"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit(index);
                            }}
                            className="bg-chart-1 text-white hover:bg-chart-1/90"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="text-foreground border-border"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-foreground flex-1 leading-relaxed">{suggestion}</p>
                        <div className="flex items-center gap-2">
                          {selectedText === suggestion ? (
                            <div className="w-6 h-6 bg-chart-1 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyText(suggestion, index);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-accent text-foreground relative"
                                  >
                                    <Copy className="w-3 h-3" />
                                    {copiedIndex === index && (
                                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                                        Copied!
                                      </span>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy suggestion</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditText(index, suggestion);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-accent text-foreground"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit suggestion</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {selectedText === suggestion && editingIndex !== index && (
                    <div className="mt-3 pt-3 border-t border-chart-1/30">
                      <div className="flex items-center gap-2 text-sm text-chart-1">
                        <Check className="w-4 h-4" />
                        <span>This optimization will be applied</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))
              )}
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={handleGenerateMore}
                variant="outline"
                disabled={isGenerating}
                className="border-dashed border-chart-1/50 hover:border-chart-1 hover:bg-chart-1/10 text-chart-1"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating more ideas...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <Sparkles className="w-4 h-4" />
                    <span>Generate More Suggestions</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}