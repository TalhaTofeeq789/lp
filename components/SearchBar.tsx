import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, History, Key, Puzzle, User, Home, HelpCircle, Moon, Sun, LogOut } from 'lucide-react';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Settings' | 'User' | 'Help';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface SearchBarProps {
  onPageChange?: (page: 'main' | 'history') => void;
  onToggleDarkMode?: () => void;
  onHelp?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export function SearchBar({ onPageChange, onToggleDarkMode, onHelp, onChangePassword, onLogout }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search items database
  const searchItems: SearchResult[] = [
    // Navigation
    {
      id: 'main-page',
      title: 'Optimize Page',
      description: 'Analyze and improve landing page content',
      category: 'Navigation',
      icon: Home,
      action: () => onPageChange?.('main')
    },
    {
      id: 'history',
      title: 'History',
      description: 'View past optimization sessions',
      category: 'Navigation',
      icon: History,
      action: () => onPageChange?.('history')
    },
    // Settings
    {
      id: 'user-settings',
      title: 'User Settings',
      description: 'Manage your account preferences',
      category: 'Settings',
      icon: Settings,
      action: () => console.log('User settings clicked')
    },
    {
      id: 'password-reset',
      title: 'Change Password',
      description: 'Update your account password',
      category: 'User',
      icon: Key,
      action: () => onChangePassword?.()
    },
    {
      id: 'integrations',
      title: 'Integration Settings',
      description: 'Configure third-party integrations',
      category: 'Settings',
      icon: Puzzle,
      action: () => console.log('Integration settings clicked')
    },
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Edit your personal information',
      category: 'User',
      icon: User,
      action: () => console.log('Profile settings clicked')
    },
    {
      id: 'dark-mode',
      title: 'Toggle Dark Mode',
      description: 'Switch between light and dark themes',
      category: 'Settings',
      icon: Moon,
      action: () => onToggleDarkMode?.()
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get assistance and documentation',
      category: 'Help',
      icon: HelpCircle,
      action: () => onHelp?.()
    },
    {
      id: 'logout',
      title: 'Sign Out',
      description: 'Log out of your account',
      category: 'User',
      icon: LogOut,
      action: () => onLogout?.()
    }
  ];

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = searchItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredResults(filtered);
  }, [query]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    result.action();
    setQuery('');
    setIsOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Navigation':
        return 'text-chart-1 bg-chart-1/10';
      case 'Settings':
        return 'text-chart-2 bg-chart-2/10';
      case 'User':
        return 'text-chart-3 bg-chart-3/10';
      case 'Help':
        return 'text-chart-4 bg-chart-4/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search settings, history, help..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-4 h-9 bg-input-background border-border focus:border-chart-1 focus:ring-chart-1/20 text-foreground"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || filteredResults.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 bg-card border-border shadow-lg">
          <div className="p-2">
            {filteredResults.length > 0 ? (
              <div className="space-y-1">
                {filteredResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(result.category)} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground group-hover:text-accent-foreground">
                              {result.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(result.category)} font-medium`}>
                              {result.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 truncate">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query.length > 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for settings, history, or help topics</p>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start typing to search...</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}