
import React, { useState, useEffect } from "react";
import HeyGenStreaming from "@/components/HeyGenStreaming";
import GitHubLink from "@/components/GitHubLink";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Get API key from localStorage or environment
    const storedApiKey = localStorage.getItem("heygen_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Prompt for API key if not found
      const key = prompt("Please enter your HeyGen API key:");
      if (key) {
        localStorage.setItem("heygen_api_key", key);
        setApiKey(key);
      }
    }
  }, []);

  return (
    <div className="relative">
      {/* Avatar video takes up the full viewport */}
      {apiKey && (
        <HeyGenStreaming 
          apiKey={apiKey}
          avatarId="Wayne_20240711"
          voiceId="f772a099cbb7421eb0176240c611fc43" // Use your voice ID
        />
      )}
      
      {/* GitHub link in top right corner */}
      <GitHubLink />
    </div>
  );
};

export default Index;
