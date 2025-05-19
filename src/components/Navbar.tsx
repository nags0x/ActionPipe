
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-50 backdrop-blur-sm bg-white/80 border-b border-blue-50">
      <div className="text-xl font-playfair italic font-normal text-black">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          AvatarAI
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="text-black hover:bg-blue-50/50 font-inter font-light" 
          asChild
        >
          <Link to="/app">Try Now</Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="w-10 h-10 rounded-full bg-white border-black border text-black hover:bg-blue-50/50 hover:text-black"
          asChild
          aria-label="View on GitHub"
        >
          <a href="https://github.com/yourusername/avatar-project" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
