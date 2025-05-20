import React, { useState, useEffect } from "react";
import LiveKitAvatarVideo from "@/components/LiveKitAvatarVideo";
import GitHubLink from "@/components/GitHubLink";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("heygenApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  return (
    <div className="relative">
      {/* Avatar video takes up the full viewport */}
      <LiveKitAvatarVideo 
        token={apiKey!}
        avatarId="Wayne_20240711"
        voiceId="f772a099cbb7421eb0176240c611fc43"
        language="en-US"
      />
      
      {/* GitHub link in top right corner */}
      <GitHubLink />
    </div>
  );
};

export default Index;
