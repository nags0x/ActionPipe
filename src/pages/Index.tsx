import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveKitAvatarVideo from "@/components/LiveKitAvatarVideo";
import GitHubLink from "@/components/GitHubLink";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("heygenApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!apiKey) {
    return null;
  }

  return (
    <div className="relative">
      <LiveKitAvatarVideo 
        token={apiKey}
        avatarId="Wayne_20240711"
        voiceId="f772a099cbb7421eb0176240c611fc43"
        knowledgeId="05703e278ac7498b80ded336fdc0c94d"
        language="en-US"
      />

      <GitHubLink />
    </div>
  );
};

export default Index;
