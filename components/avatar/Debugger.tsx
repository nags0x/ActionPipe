'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import StreamingAvatar, { AvatarQuality, StreamingEvents } from '@heygen/streaming-avatar';

interface DebuggerProps {
  errorText?: string;
  explanation?: string;
  isSpeaking?: boolean;
}

export function Debugger({ errorText, explanation, isSpeaking }: DebuggerProps) {
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);

  useEffect(() => {
    const initAvatar = async () => {
      try {
        const streamingAvatar = new StreamingAvatar({
          token: process.env.NEXT_PUBLIC_HEYGEN_TOKEN || '', // Make sure to set this in your .env.local
        });

        // Set up event listeners
        streamingAvatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
          console.log('Avatar started talking');
        });

        streamingAvatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          console.log('Stream disconnected');
        });

        streamingAvatar.on(StreamingEvents.STREAM_READY, () => {
          console.log('Stream ready');
        });

        // Create and start the avatar
        await streamingAvatar.createStartAvatar({
          quality: AvatarQuality.High,
          avatarName: 'your-avatar-id', // Replace with your avatar ID
          voice: {
            voiceId: 'default', // Replace with your voice ID
            rate: 1.0,
          },
        });

        setAvatar(streamingAvatar);
      } catch (error) {
        console.error('Failed to initialize avatar:', error);
      }
    };

    initAvatar();

    return () => {
      if (avatar) {
        avatar.stopAvatar();
      }
    };
  }, []);

  // Handle speaking state
  useEffect(() => {
    if (!avatar || !explanation) return;

    const speak = async () => {
      try {
        await avatar.speak({ text: explanation });
      } catch (error) {
        console.error('Failed to speak:', error);
      }
    };

    if (isSpeaking) {
      speak();
    }
  }, [avatar, explanation, isSpeaking]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden"
    >
      {/* Avatar Container */}
      <div className="aspect-video bg-muted relative">
        {/* The avatar will be rendered here by the SDK */}
      </div>

      {/* Error Display */}
      {errorText && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium text-destructive mb-2">Error Detected</h3>
          <p className="text-sm text-muted-foreground">{errorText}</p>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium mb-2">Explanation</h3>
          <p className="text-sm">{explanation}</p>
        </div>
      )}
    </motion.div>
  );
} 