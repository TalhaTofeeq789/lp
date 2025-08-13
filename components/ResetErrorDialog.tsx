import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface ResetErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ResetErrorDialog({ isOpen, onClose, message }: ResetErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-background border border-border shadow-2xl rounded-2xl p-8 mx-4 w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reset Failed</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We couldn't send the password reset email.
          </p>
        </div>

        {/* Error Message */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive text-sm text-center break-words">
            {message}
          </p>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
