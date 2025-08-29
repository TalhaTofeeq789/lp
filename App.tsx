import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, HelpCircle, Monitor, MonitorX } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MainPage } from './components/MainPage';
import { HistoryPage } from './components/HistoryPage';
import { CompleteScraper } from './components/CompleteScraper';
import { SearchBar } from './components/SearchBar';
import { LoginPage } from './components/LoginPage';
import { ChangePasswordDialog } from './components/ChangePasswordDialog';
import { SuccessDialog } from './components/SuccessDialog';
import { Button } from './components/ui/button';
import { DarkModeProvider, useDarkMode } from './components/DarkModeContext';
import { authService } from './services/auth';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'history' | 'scraper'>('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [hasAnalyzedUrl, setHasAnalyzedUrl] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Check for existing authentication on app load
  useEffect(() => {
    const authStatus = localStorage.getItem('optimizeHub-auth');
    const userInfo = localStorage.getItem('optimizeHub-user');
    const token = localStorage.getItem('optimizeHub-token');
    
    if (authStatus === 'true' && userInfo && token) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('Found existing user session:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('optimizeHub-auth');
        localStorage.removeItem('optimizeHub-user');
        localStorage.removeItem('optimizeHub-token');
      }
    }
  }, []);

  const handleLogin = () => {
    // Get the user data from localStorage after successful login
    const userInfo = localStorage.getItem('optimizeHub-user');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    setIsAuthenticated(true);
    localStorage.setItem('optimizeHub-auth', 'true');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setCurrentPage('main'); // Reset to main page on logout
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force logout even if API call fails
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('optimizeHub-auth');
      localStorage.removeItem('optimizeHub-user');
      localStorage.removeItem('optimizeHub-token');
      setCurrentPage('main');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLivePreview = () => {
    setIsLivePreviewOpen(!isLivePreviewOpen);
    // Auto-close sidebar when live preview is opened
    if (!isLivePreviewOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleAnalyzeAction = () => {
    setHasAnalyzedUrl(true);
    setIsSidebarOpen(false); // Close sidebar when analyze is clicked
  };

  const handleHelp = () => {
    console.log('Help clicked');
    // Implement help logic here
  };

  const handleChangePassword = () => {
    setShowChangePasswordDialog(true);
  };

  const showSuccess = (title: string, message: string) => {
    setSuccessMessage({ title, message });
    setShowSuccessDialog(true);
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordDialog(false);
    showSuccess(
      'Password Changed Successfully!',
      'Your password has been updated securely. You can now use your new password to log in.'
    );
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main dashboard if authenticated
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay - always show on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Desktop overlay - only when live preview is open */}
      {isSidebarOpen && isLivePreviewOpen && (
        <div 
          className="hidden lg:block fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Fixed Sidebar with independent scrolling */}
      <div className={`
        fixed top-0 left-0 h-screen z-50
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={toggleSidebar}
          isOpen={isSidebarOpen}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Floating Toggle Button - appears when sidebar is closed with higher z-index */}
      {!isSidebarOpen && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg lg:top-4"
          size="sm"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isLivePreviewOpen ? 'lg:ml-80' : ''
      }`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card border-border">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-medium text-foreground">Landing Page Tool</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleLivePreview}
              variant="ghost"
              size="sm"
              className={`text-foreground hover:bg-accent ${
                isLivePreviewOpen ? 'bg-chart-1/20 text-chart-1' : ''
              }`}
            >
              {isLivePreviewOpen ? (
                <MonitorX className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-accent"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleHelp}
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-accent"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sticky Top Bar for Desktop - positioned relative to content */}
        <div className="hidden lg:block sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between gap-4 py-4 pr-4 pl-16">
            {/* Search Bar - Left side */}
            <div className="flex-1 max-w-md">
              <SearchBar
                onPageChange={setCurrentPage}
                onToggleDarkMode={toggleDarkMode}
                onHelp={handleHelp}
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
              />
            </div>

            {/* Action Buttons - Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={toggleLivePreview}
                variant={isLivePreviewOpen ? "default" : "outline"}
                size="sm"
                className={`border-border hover:bg-accent text-foreground ${
                  isLivePreviewOpen ? 'bg-chart-1 hover:bg-chart-1/90 text-white' : ''
                }`}
                title={isLivePreviewOpen ? "Close Live Preview" : "Open Live Preview"}
              >
                {isLivePreviewOpen ? (
                  <MonitorX className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="border-border hover:bg-accent text-foreground"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleHelp}
                variant="outline"
                size="sm"
                className="border-border hover:bg-accent text-foreground"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Only visible on mobile */}
        <div className="lg:hidden p-4 border-b border-border bg-card">
          <SearchBar
            onPageChange={setCurrentPage}
            onToggleDarkMode={toggleDarkMode}
            onHelp={handleHelp}
            onChangePassword={handleChangePassword}
            onLogout={handleLogout}
          />
        </div>

        {/* Page Content */}
        <div className={`flex-1 ${isLivePreviewOpen && currentPage === 'main' ? 'overflow-hidden' : 'overflow-auto'}`}>
          {currentPage === 'main' ? (
            <MainPage 
              isLivePreviewOpen={isLivePreviewOpen}
              onToggleSidebar={toggleSidebar}
              onAnalyze={handleAnalyzeAction}
            />
          ) : currentPage === 'history' ? (
            <HistoryPage />
          ) : currentPage === 'scraper' ? (
            <CompleteScraper />
          ) : (
            <HistoryPage />
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
        onSuccess={handlePasswordChangeSuccess}
        userEmail={user?.email || ''}
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}