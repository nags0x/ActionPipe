import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LiveKitAvatarVideoProps {
  token: string;
  avatarId: string;
  voiceId: string;
  language: string;
  children?: React.ReactNode;
}

const LiveKitAvatarVideo = ({ token, avatarId, voiceId, language, children }: LiveKitAvatarVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Session state
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    // Dynamically import LiveKit client
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log("LiveKit client loaded");
      initializeAvatar();
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
      // Clean up resources
      closeSession();
    };
  }, []);

  const initializeAvatar = async () => {
    try {
      setIsLoading(true);
      console.log("Initializing avatar with token:", token.substring(0, 5) + "...");
      
      // Step 1: Get session token
      const tokenResponse = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': token,
        },
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get session token: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const newSessionToken = tokenData.data.token;
      console.log("Session token obtained:", newSessionToken.substring(0, 5) + "...");

      // Step 2: Create new session
      const sessionResponse = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newSessionToken}`,
        },
        body: JSON.stringify({
          quality: "high",
          avatar_name: avatarId,
          voice: {
            voice_id: voiceId,
            rate: 1.0,
          },
          version: "v2",
          video_encoding: "H264",
        }),
      });

      const responseText = await sessionResponse.text();
      console.log("Full response:", responseText);

      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session: ${sessionResponse.status} - ${responseText}`);
      }

      const sessionData = JSON.parse(responseText);
      const newSessionInfo = sessionData.data;
      console.log("Session created:", newSessionInfo.session_id);

      // Step 3: Create LiveKit Room
      const LivekitClient = (window as any).LivekitClient;
      const newRoom = new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: LivekitClient.VideoPresets.h720.resolution,
        },
      });

      // Handle room events
      newRoom.on(LivekitClient.RoomEvent.DataReceived, (message: any) => {
        const data = new TextDecoder().decode(message);
        console.log("Room message:", JSON.parse(data));
      });

      // Handle media streams
      const newMediaStream = new MediaStream();
      newRoom.on(LivekitClient.RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === "video" || track.kind === "audio") {
          newMediaStream.addTrack(track.mediaStreamTrack);
          if (
            newMediaStream.getVideoTracks().length > 0 &&
            newMediaStream.getAudioTracks().length > 0
          ) {
            if (videoRef.current) {
              videoRef.current.srcObject = newMediaStream;
              setIsLoading(false);
              console.log("Media stream ready");
            }
          }
        }
      });

      // Handle media stream removal
      newRoom.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track: any) => {
        const mediaTrack = track.mediaStreamTrack;
        if (mediaTrack) {
          newMediaStream.removeTrack(mediaTrack);
        }
      });

      // Handle room connection state changes
      newRoom.on(LivekitClient.RoomEvent.Disconnected, (reason: string) => {
        console.log(`Room disconnected: ${reason}`);
        setIsLoading(true);
        setIsSessionReady(false);
      });

      await newRoom.prepareConnection(newSessionInfo.url, newSessionInfo.access_token);
      console.log("Connection prepared");

      // Step 4: Connect WebSocket
      const params = new URLSearchParams({
        session_id: newSessionInfo.session_id,
        session_token: newSessionToken,
        silence_response: 'false',
        opening_text: "Hello, how can I help you?",
        stt_language: language.split('-')[0] || 'en',
      });

      const wsUrl = `wss://${new URL('https://api.heygen.com').hostname}/v1/ws/streaming.chat?${params}`;
      const ws = new WebSocket(wsUrl);

      ws.addEventListener("message", (event) => {
        const eventData = JSON.parse(event.data);
        console.log("WebSocket event:", eventData);
        
        // Update UI based on avatar state
        if (eventData.type === "avatar_talking_start") {
          setIsTalking(true);
        } else if (eventData.type === "avatar_talking_end") {
          setIsTalking(false);
        } else if (eventData.type === "user_talking_start") {
          setIsListening(true);
        } else if (eventData.type === "user_talking_end") {
          setIsListening(false);
        }
      });

      // Step 5: Start streaming session
      const startResponse = await fetch('https://api.heygen.com/v1/streaming.start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newSessionToken}`,
        },
        body: JSON.stringify({
          session_id: newSessionInfo.session_id,
        }),
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(`Failed to start streaming: ${startResponse.status} - ${errorText}`);
      }

      // Connect to LiveKit room
      await newRoom.connect(newSessionInfo.url, newSessionInfo.access_token);
      console.log("Connected to room");
      
      // IMPORTANT: Set all state variables before sending the greeting
      // This ensures the state is updated before we try to use it
      setSessionToken(newSessionToken);
      setSessionInfo(newSessionInfo);
      setRoom(newRoom);
      setMediaStream(newMediaStream);
      setWebSocket(ws);
      setIsSessionReady(true);
      setIsLoading(false);
      
      // Wait for state to update before sending greeting
      setTimeout(() => {
        // Double-check that session is ready before sending
        if (newSessionInfo && newSessionToken) {
          console.log("Sending initial greeting");
          // Use direct API call instead of sendText function to avoid state dependency
          fetch('https://api.heygen.com/v1/streaming.task', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newSessionToken}`,
            },
            body: JSON.stringify({
              session_id: newSessionInfo.session_id,
              text: "Hello, I'm your virtual assistant. How can I help you today?",
              task_type: "talk",
            }),
          }).catch(error => {
            console.error("Error sending initial greeting:", error);
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error initializing avatar:", error);
      toast.error("Failed to initialize avatar: " + (error as Error).message);
      setIsLoading(false);
      setIsSessionReady(false);
    }
  };

  const sendText = async (text: string, taskType = "talk") => {
    if (!sessionInfo || !sessionToken) {
      console.error("No active session");
      toast.error("No active session. Please wait for the avatar to initialize.");
      return;
    }
    
    try {
      setIsTalking(true);
      
      const response = await fetch('https://api.heygen.com/v1/streaming.task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          session_id: sessionInfo.session_id,
          text: text,
          task_type: taskType,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send text: ${response.status} - ${errorText}`);
      }
      
      console.log(`Sent text (${taskType}): ${text}`);
    } catch (error) {
      console.error("Error sending text:", error);
      toast.error("Failed to send text: " + (error as Error).message);
      setIsTalking(false);
    }
  };

  const closeSession = async () => {
    if (!sessionInfo || !sessionToken) {
      return;
    }

    try {
      await fetch('https://api.heygen.com/v1/streaming.stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          session_id: sessionInfo.session_id,
        }),
      });

      // Close WebSocket
      if (webSocket) {
        webSocket.close();
      }
      
      // Disconnect from LiveKit room
      if (room) {
        room.disconnect();
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setSessionInfo(null);
      setSessionToken(null);
      setRoom(null);
      setWebSocket(null);
      setMediaStream(null);
      
      console.log("Session closed");
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (sessionInfo && sessionToken) {
        // Close the session when component unmounts
        fetch('https://api.heygen.com/v1/streaming.stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            session_id: sessionInfo.session_id,
          }),
        }).catch(error => {
          console.error("Error closing session:", error);
        });
        
        // Close WebSocket
        if (webSocket) {
          webSocket.close();
        }
        
        // Disconnect from LiveKit room
        if (room) {
          room.disconnect();
        }
      }
    };
  }, [sessionInfo, sessionToken, webSocket, room]);

  // Functions for FloatingControls
  const handleStart = () => {
    if (!sessionInfo) {
      initializeAvatar();
    } else {
      sendText("Hello, I'm back. How can I help you?");
    }
  };

  const handleTalk = () => {
    sendText("How can I assist you today?");
  };

  const handleRepeat = () => {
    sendText("Could you please repeat that?", "repeat");
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Initializing avatar...</p>
          </div>
        </div>
      )}
      
      {!isSessionReady && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center">
            <p>Connecting to session...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {children}
    </div>
  );
};

export default LiveKitAvatarVideo;
