
import { useEffect, useRef, useState } from "react";

const AvatarVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would be replaced with actual video stream connection logic
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      {isLoading ? (
        <div className="animate-pulse w-24 h-24 rounded-full bg-black/10" />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={false}
          aria-label="Avatar video stream"
        />
      )}
    </div>
  );
};

export default AvatarVideo;
