
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
    console.log("Start avatar stream");
  };
  
  const handleClose = () => {
    setIsActive(false);
    if (onClose) onClose();
    console.log("Close avatar stream");
  };
  
  const handleTalk = () => {
    if (onTalk) onTalk();
    console.log("Talk to avatar");
  };
  
  const handleRepeat = () => {
    if (onRepeat) onRepeat();
    console.log("Make avatar repeat");
  };
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
      {!isActive ? (
        <Button 
          variant="outline" 
          size="icon" 
          className="w-12 h-12 rounded-full bg-black/10 border-white border text-white hover:bg-black/20 hover:text-white"
          onClick={handleStart}
          aria-label="Start avatar"
        >
          <Play className="h-6 w-6" />
        </Button>
      ) : (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-black/10 border-white border text-white hover:bg-black/20 hover:text-white"
            onClick={handleClose}
            aria-label="Close avatar"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-black/10 border-white border text-white hover:bg-black/20 hover:text-white"
            onClick={handleTalk}
            aria-label="Talk to avatar"
          >
            <Mic className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-black/10 border-white border text-white hover:bg-black/20 hover:text-white"
            onClick={handleRepeat}
            aria-label="Make avatar repeat"
          >
            <Repeat className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
};

export default FloatingControls;
