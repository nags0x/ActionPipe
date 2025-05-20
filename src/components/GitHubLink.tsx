import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const GitHubLink = () => {
  return (
    <div className="absolute top-4 right-4 z-[100] pointer-events-auto">
      <Button 
        variant="outline" 
        size="icon" 
        className="w-10 h-10 rounded-full bg-white/10 border-black dark:border-white border text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
        asChild
        aria-label="View on GitHub"
      >
        <a href="https://github.com/nags0x/ActionPipe" target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5" />
        </a>
      </Button>
    </div>
  );
};

export default GitHubLink;
