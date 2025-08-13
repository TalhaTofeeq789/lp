import { CheckCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface ResetSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ResetSuccessDialog({ isOpen, onClose, email }: ResetSuccessDialogProps) {
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reset Link Sent!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We've sent a password reset link to your email address.
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <p className="text-foreground font-medium text-center break-words">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Check your inbox and click the link in the email to reset your password. 
            If you don't see the email, please check your spam folder.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-lg"
          >
            Got it, thanks!
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
