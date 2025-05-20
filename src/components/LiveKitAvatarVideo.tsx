import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Play, X, Mic, Repeat, MessageSquare, Video, VideoOff, MicOff } from "lucide-react";
import FloatingControls from "./FloatingControls";

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
  const [showChat, setShowChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'avatar', text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  
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

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', text }]);
    setChatInput("");
    
    // Send to avatar
    await sendText(text, "talk");
  };

  const toggleMute = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background blur with subtle shade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gray-100/40 dark:bg-gray-700/40 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 -right-24 w-96 h-96 bg-gray-100/40 dark:bg-gray-700/40 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-40 w-32 h-32 border border-gray-200/30 dark:border-gray-600/30 rounded-full animate-float opacity-20"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-gray-200/30 dark:border-gray-600/30 rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/50 dark:from-transparent dark:via-gray-800/50 dark:to-gray-900/50"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Video container with glass effect */}
        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 shadow-xl">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white"></div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Status indicators */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isTalking && (
              <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-sm text-gray-700 dark:text-gray-300 font-inter font-light backdrop-blur-sm">
                Speaking...
              </div>
            )}
            {isListening && (
              <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-sm text-gray-700 dark:text-gray-300 font-inter font-light backdrop-blur-sm">
                Listening...
              </div>
            )}
          </div>
        </div>

        {/* Floating controls */}
        <FloatingControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          showChat={showChat}
          onMute={toggleMute}
          onVideoToggle={toggleVideo}
          onChatToggle={() => setShowChat(!showChat)}
          onRepeat={handleRepeat}
          onTalk={handleTalk}
          onStart={handleStart}
          isSessionReady={isSessionReady}
          isTalking={isTalking}
          isListening={isListening}
        />

        {/* Chat interface */}
        {showChat && (
          <div className="fixed bottom-24 right-6 w-96 h-[500px] rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-inter font-light text-gray-900 dark:text-white">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="font-inter font-light text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim()) {
                    sendChatMessage(chatInput);
                    setChatInput('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-inter font-light focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                />
                <Button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full px-4"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveKitAvatarVideo;
