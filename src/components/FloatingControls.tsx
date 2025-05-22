import { Button } from "@/components/ui/button";
import { Play, X, Mic, Repeat, MessageSquare, Video, VideoOff, MicOff } from "lucide-react";
import { useState } from "react";

interface FloatingControlsProps {
  onStart?: () => void;
  onClose?: () => void;
  onTalk?: () => void;
  onRepeat?: () => void;
  onMute?: () => void;
  onVideoToggle?: () => void;
  onChatToggle?: () => void;
  isListening?: boolean;
  isTalking?: boolean;
  isSessionReady?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  showChat?: boolean;
}

const FloatingControls = ({
  onStart,
  onClose,
  onTalk,
  onRepeat,
  onMute,
  onVideoToggle,
  onChatToggle,
  isMuted,
  isVideoOff,
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
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
      {!isActive ? (
        <Button 
          variant="outline" 
          size="icon" 
          className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50"
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
            className="w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50"
            onClick={onMute}
            aria-label="Toggle microphone"
          >
            {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50"
            onClick={onVideoToggle}
            aria-label="Toggle video"
          >
            {isVideoOff ? <VideoOff className="h-7 w-7" /> : <Video className="h-7 w-7" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50"
            onClick={onChatToggle}
            aria-label="Toggle chat"
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50"
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
