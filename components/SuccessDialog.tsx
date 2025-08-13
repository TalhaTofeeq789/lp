import { CheckCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessDialog({ isOpen, onClose, title, message }: SuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-lg min-w-20"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
