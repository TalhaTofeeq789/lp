import React, { useState } from 'react';
import { X, Home, History, Sparkles, TrendingUp, Zap, Menu, User, Settings, KeyRound, LogOut, Globe } from 'lucide-react';
import { Badge } from './ui/badge';
import { useDarkMode } from './DarkModeContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SidebarProps {
  currentPage: 'main' | 'history' | 'scraper';
  onPageChange: (page: 'main' | 'history' | 'scraper') => void;
  onClose: () => void;
  onToggle: () => void;
  isOpen: boolean;
  onChangePassword?: () => void;
  onLogout?: () => void;
  user?: {
    uid: string;
    email: string;
    displayName: string | null;
    username?: string;
  } | null;
}

export function Sidebar({ currentPage, onPageChange, onClose, onToggle, isOpen, onChangePassword, onLogout, user }: SidebarProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const navigationItems = [
    {
      id: 'main' as const,
      label: 'Optimize Page',
      icon: Home,
      description: 'Analyze and improve content',
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: History,
      description: 'View past optimizations',
      badge: '4'
    },
    {
      id: 'scraper' as const,
      label: 'Complete Scraper',
      icon: Globe,
      description: 'Download complete websites',
    },
  ];

  const handleChangePassword = () => {
    onChangePassword?.();
  };

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <div className="w-80 h-screen bg-sidebar border-r border-sidebar-border shadow-lg overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-chart-1 to-chart-2 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">OptimizeHub</h2>
              <p className="text-xs text-sidebar-foreground/70">AI-Powered Optimization</p>
            </div>
          </div>
          
          {/* Toggle button in top right */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="hidden lg:flex p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4 text-sidebar-foreground" />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
              title="Close sidebar"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="p-6 space-y-8">
          {/* Navigation */}
          <nav>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left
                      transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    {/* This button triggers onPageChange with the correct id ('main' or 'history') to switch pages in App.tsx */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-sidebar-accent/50 group-hover:bg-sidebar-accent'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-sidebar-primary-foreground/80' : 'text-sidebar-foreground/60'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge 
                        className={`text-xs px-2 py-1 ${
                          isActive 
                            ? 'bg-white/20 text-sidebar-primary-foreground border-white/20' 
                            : 'bg-chart-1/20 text-chart-1 border-chart-1/30'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-sidebar-foreground px-2">Quick Stats</h3>
            <div className="space-y-3">
              <div className="bg-chart-2/10 border border-chart-2/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-chart-2/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-chart-2" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-sidebar-foreground">Avg. Improvement</div>
                    <div className="text-lg font-semibold text-chart-2">+23%</div>
                  </div>
                </div>
              </div>
              <div className="bg-chart-1/10 border border-chart-1/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-chart-1/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-chart-1" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-sidebar-foreground">Pages Optimized</div>
                    <div className="text-lg font-semibold text-chart-1">127</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-sidebar">
        {/* User Info with Settings - Anchored to bottom */}
        <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-lg p-3 border border-chart-1/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-chart-1 to-chart-2 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.displayName || user?.username || 'User'}
              </h4>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            {/* Settings Dropdown - Inside the user box on the right */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/10 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  side="top"
                  className="w-48 bg-card border-border"
                >
                  <DropdownMenuItem 
                    onClick={handleChangePassword}
                    className="cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}