import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authService } from '../services/auth';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
}

export function ForgotPasswordDialog({ isOpen, onClose, onSuccess, onError }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the actual API for password reset
      const response = await authService.sendPasswordResetEmail(email);
      
      console.log('Password reset response:', response);
      
      // Check if the response indicates success
      if (response.status === 'success') {
        console.log('Password reset successful:', response.message);
        onSuccess(email);
      } else {
        // Handle unsuccessful response
        console.error('Password reset failed:', response.message);
        onError(response.message || 'Failed to send reset link. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      onError(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog - Bigger size */}
      <div className="relative bg-background border border-border shadow-2xl rounded-2xl p-8 mx-4 w-full max-w-lg animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-chart-1 to-chart-2 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Mail className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Reset Password</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reset-email" className="text-base font-medium">
              Email Address
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full h-12 text-base"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
