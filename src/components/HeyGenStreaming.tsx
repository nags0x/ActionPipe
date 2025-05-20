import React, { useRef, useState, useEffect } from "react";
import { Room, RoomEvent, VideoPresets, Track, RemoteTrackPublication, RemoteParticipant } from "livekit-client";

const API_CONFIG = {
  serverUrl: "https://api.heygen.com",
};

type SessionInfo = {
  session_id: string;
  url: string;
  access_token: string;
};

interface HeyGenStreamingProps {
  apiKey: string;
  avatarId?: string;
  voiceId?: string;
}

const HeyGenStreaming: React.FC<HeyGenStreamingProps> = ({
  apiKey,
  avatarId = "Wayne_20240711",
  voiceId = ""
}) => {
  const mediaElementRef = useRef<HTMLVideoElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  
  const [avatarID, setAvatarID] = useState(avatarId);
  const [voiceID, setVoiceID] = useState(voiceId);
  const [taskInput, setTaskInput] = useState("");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [startDisabled, setStartDisabled] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webSocket) webSocket.close();
      if (room) room.disconnect();
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webSocket, room, mediaStream]);

  const updateStatus = (message: string) => {
    if (statusRef.current) {
      statusRef.current.insertAdjacentHTML(
        'beforeend',
        `[${new Date().toLocaleTimeString()}] ${message}<br>`
      );
      statusRef.current.scrollTo(0, statusRef.current.scrollHeight);
    }
  };

  const getSessionToken = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.serverUrl}/v1/streaming.create_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessionToken(data.data.token);
      updateStatus("Session token obtained");
      return data.data.token;
    } catch (error) {
      updateStatus(`Token error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const connectWebSocket = (sessionId: string, token: string) => {
    const params = new URLSearchParams({
      session_id: sessionId,
      session_token: token,
      silence_response: "false",
      opening_text: "Hello, how can I help you?",
      stt_language: "en",
    });

    const wsUrl = `wss://${new URL(API_CONFIG.serverUrl).hostname}/v1/ws/streaming.chat?${params}`;
    const ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      updateStatus("WebSocket connected");
    });

    ws.addEventListener("message", (event) => {
      try {
        const eventData = JSON.parse(event.data);
        console.log("WebSocket event:", eventData);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.addEventListener("error", (event) => {
      updateStatus("WebSocket error");
      console.error("WebSocket error:", event);
    });

    ws.addEventListener("close", (event) => {
      updateStatus(`WebSocket closed: ${event.code}`);
    });

    setWebSocket(ws);
  };

  const createNewSession = async () => {
    try {
      let token = sessionToken || await getSessionToken();
      const response = await fetch(
        `${API_CONFIG.serverUrl}/v1/streaming.new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quality: "high",
            avatar_name: avatarID,
            voice: { voice_id: voiceID, rate: 1.0 },
            version: "v2",
            video_encoding: "H264",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setSessionInfo(data.data);
      updateStatus(`Session created: ${data.data.session_id}`);

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      const stream = new MediaStream();
      
      const handleTrackSubscribed = (
        track: Track,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
          stream.addTrack(track.mediaStreamTrack);
          
          // Check if we have both audio and video tracks
          const hasVideo = stream.getVideoTracks().length > 0;
          const hasAudio = stream.getAudioTracks().length > 0;
          
          if (hasVideo && hasAudio && mediaElementRef.current) {
            mediaElementRef.current.srcObject = stream;
            updateStatus("Media stream ready");
          }
        }
      };

      newRoom
        .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
        .on(RoomEvent.TrackUnsubscribed, (track) => {
          stream.removeTrack(track.mediaStreamTrack);
        })
        .on(RoomEvent.Disconnected, (reason) => {
          updateStatus(`Disconnected: ${reason}`);
          setStartDisabled(false);
        });

      await newRoom.prepareConnection(data.data.url, data.data.access_token);
      updateStatus("Connection prepared");
      setRoom(newRoom);
      setMediaStream(stream);
      connectWebSocket(data.data.session_id, token);
      updateStatus("Session initialized");

    } catch (error) {
      updateStatus(`Session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Session creation error:", error);
    }
  };

  const startStreamingSession = async () => {
    if (!sessionInfo || !sessionToken || !room) {
      updateStatus("Cannot start: missing session info");
      return;
    }
    
    try {
      const startResponse = await fetch(
        `${API_CONFIG.serverUrl}/v1/streaming.start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ session_id: sessionInfo.session_id }),
        }
      );

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(`Start failed: ${startResponse.status} - ${errorText}`);
      }

      await room.connect(sessionInfo.url, sessionInfo.access_token);
      setStartDisabled(true);
      updateStatus("Streaming active");

    } catch (error) {
      updateStatus(`Streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Streaming error:", error);
    }
  };

  const sendText = async (text: string, taskType: string = "talk") => {
    if (!sessionInfo || !sessionToken) {
      updateStatus("No active session");
      return;
    }
    
    try {
      const response = await fetch(
        `${API_CONFIG.serverUrl}/v1/streaming.task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            session_id: sessionInfo.session_id,
            text,
            task_type: taskType,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Task failed: ${response.status} - ${errorText}`);
      }

      updateStatus(`Sent text (${taskType}): ${text}`);
    } catch (error) {
      updateStatus(`Text error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Send text error:", error);
    }
  };

  const closeSession = async () => {
    if (!sessionInfo || !sessionToken) {
      updateStatus("No active session");
      return;
    }
    
    try {
      const response = await fetch(
        `${API_CONFIG.serverUrl}/v1/streaming.stop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            session_id: sessionInfo.session_id,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stop failed: ${response.status} - ${errorText}`);
      }

      if (webSocket) {
        webSocket.close();
        setWebSocket(null);
      }
      
      if (room) {
        room.disconnect();
        setRoom(null);
      }
      
      if (mediaElementRef.current) {
        mediaElementRef.current.srcObject = null;
      }
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      setSessionInfo(null);
      setMediaStream(null);
      setSessionToken(null);
      setStartDisabled(false);
      updateStatus("Session closed");
    } catch (error) {
      updateStatus(`Close error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Close session error:", error);
    }
  };

  // UI
  return (
    <div className="bg-gray-100 p-5 font-sans min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-5 rounded-lg shadow-md">
        {/* Top Controls */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          <input
            type="text"
            placeholder="Avatar ID"
            value={avatarID}
            onChange={e => setAvatarID(e.target.value)}
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Voice ID"
            value={voiceID}
            onChange={e => setVoiceID(e.target.value)}
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md"
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              await createNewSession();
              await startStreamingSession();
            }}
            disabled={startDisabled}
          >
            Start
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={closeSession}
          >
            Close
          </button>
        </div>

        {/* Task Controls */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          <input
            type="text"
            placeholder="Enter text for avatar to speak"
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md"
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            onClick={() => {
              const text = taskInput.trim();
              if (text) {
                sendText(text, "talk");
                setTaskInput("");
              }
            }}
          >
            Talk (LLM)
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              const text = taskInput.trim();
              if (text) {
                sendText(text, "repeat");
                setTaskInput("");
              }
            }}
          >
            Repeat
          </button>
        </div>

        {/* Video */}
        <video
          ref={mediaElementRef}
          className="w-full max-h-[400px] border rounded-lg my-5"
          autoPlay
          playsInline
        ></video>

        {/* Status */}
        <div
          ref={statusRef}
          className="p-2.5 bg-gray-50 border border-gray-300 rounded-md h-[100px] overflow-y-auto font-mono text-sm"
        ></div>
      </div>
    </div>
  );
};

export default HeyGenStreaming;
