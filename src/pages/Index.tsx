
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
    }
  }, [navigate]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Avatar video takes up the full viewport */}
      <AvatarVideo />
      
      {/* Floating controls positioned at the bottom center */}
      <FloatingControls />
      
      {/* GitHub link in top right corner */}
      <GitHubLink />
    </div>
  );
};

export default Index;
