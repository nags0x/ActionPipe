
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const GitHubLink = () => {
  return (
    <div className="absolute top-4 right-4">
      <Button 
        variant="outline" 
        size="icon" 
        className="w-10 h-10 rounded-full bg-white/10 border-black border text-black hover:bg-black/5 hover:text-black"
        asChild
        aria-label="View on GitHub"
      >
        <a href="https://github.com/yourusername/avatar-project" target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5" />
        </a>
      </Button>
    </div>
  );
};

export default GitHubLink;
