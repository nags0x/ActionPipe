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
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Main video container - 80% of screen */}
      <div className="relative w-[80%] h-[80%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-lg font-medium">Initializing avatar...</p>
            </div>
          </div>
        )}
        
        {!isSessionReady && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-white text-center">
              <p className="text-lg font-medium">Connecting to session...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Status indicators */}
        <div className="absolute bottom-6 left-6 flex gap-3">
          {isListening && (
            <div className="px-4 py-2 bg-blue-500/90 backdrop-blur-md text-white rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Listening...
            </div>
          )}
          {isTalking && (
            <div className="px-4 py-2 bg-green-500/90 backdrop-blur-md text-white rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Talking...
            </div>
          )}
        </div>

        {/* Quick Controls */}
        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-200"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-200"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border-white/20 border text-white hover:bg-black/30 hover:text-white transition-all duration-200"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>

        {/* Floating Controls */}
        <FloatingControls
          onStart={handleStart}
          onClose={closeSession}
          onTalk={() => sendText("How can I assist you today?")}
          onRepeat={() => sendText("Could you please repeat that?", "repeat")}
          isListening={isListening}
        />

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-6 right-24 w-96 h-[calc(100%-3rem)] bg-black/40 backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-2xl transition-all duration-300">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-white/10 text-white backdrop-blur-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-white/50 backdrop-blur-sm"
                />
                <Button
                  onClick={() => sendChatMessage(chatInput)}
                  className="px-6 py-3 bg-blue-500/90 text-white rounded-xl hover:bg-blue-600/90 transition-all duration-200"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveKitAvatarVideo;
