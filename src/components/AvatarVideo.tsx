import React, { useEffect, useRef, useState } from "react";
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents, 
  VoiceEmotion, 
  STTProvider, 
  VoiceChatTransport,
  TaskType 
} from '@heygen/streaming-avatar';

interface AvatarVideoProps {
  token: string;
  avatarId: string;
  knowledgeId: string;
  voiceId: string;
  language: string;
  children?: React.ReactNode;
}

const AvatarVideo = ({ token, avatarId, knowledgeId, voiceId, language, children }: AvatarVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamingAvatar, setStreamingAvatar] = useState<StreamingAvatar | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        // Log the API key for debugging (remove in production)
        console.log("Using API key:", token);
        
        // Use the API key directly in the x-api-key header as shown in the documentation
        const tokenResponse = await fetch('https://api.heygen.com/v1/streaming.create_token', {
          method: 'POST',
          headers: {
            'x-api-key': token, // Use x-api-key instead of Authorization
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Empty body is sufficient according to docs
        });
        
        console.log("Token response status:", tokenResponse.status);
        const responseText = await tokenResponse.text();
        console.log("Token response body:", responseText);
        
        if (!tokenResponse.ok) {
          throw new Error(`Failed to get session token: ${tokenResponse.status} - ${responseText}`);
        }
        
        // Parse the response text as JSON
        const tokenData = JSON.parse(responseText);
        console.log("Token data:", tokenData);
        
        // Use the unique session token for this streaming session
        const sessionToken = tokenData.data.token;
        const avatar = new StreamingAvatar({ token: sessionToken });
        
        // Set up event listeners
        avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
          setIsTalking(true);
        });

        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          setIsTalking(false);
        });

        avatar.on(StreamingEvents.USER_START, () => {
          setIsListening(true);
        });

        avatar.on(StreamingEvents.USER_STOP, () => {
          setIsListening(false);
        });

        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          console.log('Stream disconnected');
          setIsLoading(true);
        });

        avatar.on(StreamingEvents.STREAM_READY, (event) => {
          console.log('Stream ready:', event);
          if (videoRef.current && event.detail) {
            videoRef.current.srcObject = event.detail;
          }
          setIsLoading(false);
        });

        try {
          console.log("Creating avatar with parameters:", {
            quality: AvatarQuality.High,
            avatarId: avatarId,
            knowledgeId: knowledgeId,
            voice: {
              voiceId: voiceId,
              rate: 1.0,
              emotion: VoiceEmotion.FRIENDLY,
            },
            sttSettings: {
              provider: STTProvider.DEEPGRAM,
              confidence: 0.55,
            },
            language: language,
            voiceChatTransport: VoiceChatTransport.WEBSOCKET,
          });
          
          const sessionInfo = await avatar.createStartAvatar({
            quality: AvatarQuality.High,
            avatarName: avatarId,
            voice: {
              voiceId: voiceId
            },
            language: language
          });
          
          console.log("Session info:", sessionInfo);
          
          setStreamingAvatar(avatar);
        } catch (error) {
          console.error('Error creating avatar session:', error);
          setIsLoading(false);
        }

        // Start voice chat automatically
        await avatar.startVoiceChat({
          isInputAudioMuted: false
        });

      } catch (error) {
        console.error('Error initializing avatar:', error);
        setIsLoading(false);
      }
    };

    initializeAvatar();

    return () => {
      if (streamingAvatar) {
        streamingAvatar.stopAvatar();
      }
    };
  }, [token, avatarId, knowledgeId, voiceId, language]);

  const speak = (text: string) => {
    if (streamingAvatar) {
      streamingAvatar.speak({ 
        text,
        task_type: TaskType.TALK // This will use the OpenAI integration through HeyGen
      });
    }
  };

  const startVoiceChat = async () => {
    if (streamingAvatar) {
      await streamingAvatar.startVoiceChat({
        isInputAudioMuted: false
      });
    }
  };

  const stopVoiceChat = () => {
    if (streamingAvatar) {
      streamingAvatar.closeVoiceChat();
    }
  };

  const toggleMute = () => {
    if (streamingAvatar) {
      if (isListening) {
        streamingAvatar.stopListening();
      } else {
        streamingAvatar.startListening();
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center bg-transparent border-2 border-red-500">
        {isLoading ? (
          <div className="animate-pulse w-24 h-24 rounded-full bg-black/10" />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-gray-100"
            autoPlay
            playsInline
            muted={false}
            aria-label="Avatar video stream"
          />
        )}
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {isListening && (
          <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
            Listening...
          </div>
        )}
        {isTalking && (
          <div className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
            Talking...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={toggleMute}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          {isListening ? 'Mute' : 'Unmute'}
        </button>
      </div>

      {/* Export methods for FloatingControls */}
      {children && React.cloneElement(children as React.ReactElement, {
        onStart: startVoiceChat,
        onClose: stopVoiceChat,
        onTalk: toggleMute,
        onRepeat: () => speak("Could you please repeat that?"),
        isListening: isListening
      })}
    </div>
  );
};

export default AvatarVideo;
