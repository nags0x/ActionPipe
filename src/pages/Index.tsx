
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarVideo from "@/components/AvatarVideo";
import FloatingControls from "@/components/FloatingControls";
import GitHubLink from "@/components/GitHubLink";
import { toast } from "sonner";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if API key exists
    const storedApiKey = localStorage.getItem("heygenApiKey");
    setApiKey(storedApiKey);
    
    if (!storedApiKey) {
      toast.error("Please configure your API key first");
      navigate("/");
    } else {
      console.log("Using API key:", storedApiKey.substring(0, 5) + "...");
    }
  }, [navigate]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Avatar video takes up the full viewport */}
      {apiKey && (
        <AvatarVideo 
          token={apiKey}
          avatarId="54ba4feb02b1435abba18de09c5d3643"
          knowledgeId="fd83e7d66d264edab6f7d8aa093d3594"
          voiceId="f772a099cbb7421eb0176240c611fc43"
          language="en-US"
        >
          <FloatingControls />
        </AvatarVideo>
      )}
      
      {/* GitHub link in top right corner */}
      <GitHubLink />
    </div>
  );
};

export default Index;
