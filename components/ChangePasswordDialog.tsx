import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function ChangePasswordDialog({ isOpen, onClose, userEmail }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Password strength calculation function
  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Length check (more lenient)
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 15;
    
    // Character variety checks (simplified)
    if (/[a-z]/.test(password)) score += 20; // lowercase
    if (/[A-Z]/.test(password)) score += 20; // uppercase
    if (/[0-9]/.test(password)) score += 20; // numbers
    
    // Determine label and color based on score (3 stages only)
    let label = '';
    let color = '';
    
    if (score < 40) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score < 70) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }
    
    return { score, label, color };
  };

  // Update password strength when newPassword changes
  useEffect(() => {
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      setError('New password must be different from the old password');
      return;
    }

    // Check if passwords are not empty
    if (!oldPassword.trim() || !newPassword.trim()) {
      setError('Both password fields are required');
      return;
    }

    // Check minimum password length
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    // TODO: Add backend API call to change password
    // For now, just simulate the process
    setTimeout(() => {
      console.log('Password change request:', { 
        email: userEmail, 
        oldPassword: '***', 
        newPassword: '***' 
      });
      
      // Simulate success for now
      setIsLoading(false);
      setOldPassword('');
      setNewPassword('');
      onClose();
      
      // In real implementation, you would make API call here:
      // try {
      //   await authService.changePassword(oldPassword, newPassword);
      //   // Handle success
      // } catch (error) {
      //   setError('Failed to change password. Please check your old password.');
      // }
    }, 1000);
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Change Password
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              readOnly
              className="bg-muted border-border text-foreground font-semibold cursor-not-allowed"
            />
          </div>

          {/* Old Password Field */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-foreground">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-input-background border-border focus:border-chart-1 focus:ring-chart-1/20 text-foreground pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-input-background border-border focus:border-chart-1 focus:ring-chart-1/20 text-foreground pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Password Strength:</span>
                  <span className={`text-sm font-medium ${
                    passwordStrength.label === 'Weak' ? 'text-red-500' :
                    passwordStrength.label === 'Fair' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className={`h-full transition-all duration-300 ease-out ${
                      passwordStrength.label === 'Weak' ? 'bg-red-500' :
                      passwordStrength.label === 'Fair' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {passwordStrength.score < 40 && 'Try adding uppercase letters and numbers'}
                  {passwordStrength.score >= 40 && passwordStrength.score < 70 && 'Good! Consider making it a bit longer'}
                  {passwordStrength.score >= 70 && 'Excellent! Your password is strong'}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing...
                </div>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
