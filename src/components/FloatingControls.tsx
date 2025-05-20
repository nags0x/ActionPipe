import { Button } from "@/components/ui/button";
import { Play, X, Mic, Repeat } from "lucide-react";
import { useState } from "react";

interface FloatingControlsProps {
  onStart?: () => void;
  onClose?: () => void;
  onTalk?: () => void;
  onRepeat?: () => void;
  isListening?: boolean;
}

const FloatingControls = ({
  onStart,
  onClose,
  onTalk,
  onRepeat,
  isListening
}: FloatingControlsProps) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleStart = () => {
    setIsActive(true);
    if (onStart) onStart();
  };
  
  const handleClose = () => {
    setIsActive(false);
    if (onClose) onClose();
  };
  
  const handleTalk = () => {
    if (onTalk) onTalk();
  };
  
  const handleRepeat = () => {
    if (onRepeat) onRepeat();
  };
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
      {!isActive ? (
        <Button 
          variant="outline" 
          size="icon" 
          className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          onClick={handleStart}
          aria-label="Start avatar"
        >
          <Play className="h-8 w-8" />
        </Button>
      ) : (
        <div className="flex gap-4 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            onClick={handleTalk}
            aria-label="Talk to avatar"
          >
            <div className="relative">
              <Mic className={`h-7 w-7 ${isListening ? 'text-blue-400' : ''}`} />
              {isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            onClick={handleRepeat}
            aria-label="Make avatar repeat"
          >
            <Repeat className="h-7 w-7" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
            onClick={handleClose}
            aria-label="Close avatar"
          >
            <X className="h-7 w-7" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FloatingControls;
