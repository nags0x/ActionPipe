import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Play, ArrowRight, Speech, SquareMousePointer, Move } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiInputDialog from "@/components/ApiInputDialog";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { FlipWords } from "@/components/ui/flip-words";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { toast } from "sonner";

const LandingPage = () => {
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartExperience = () => {
    const apiKey = localStorage.getItem("heygenApiKey");
    if (!apiKey) {
      toast.error("Please configure your API key first", {
        duration: 3000
      });
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* Shooting Stars Background */}
      <ShootingStars className="opacity-30" />
      
      {/* Background blur with subtle shade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gray-100/40 dark:bg-gray-700/40 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 -right-24 w-96 h-96 bg-gray-100/40 dark:bg-gray-700/40 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-40 w-32 h-32 border border-gray-200/30 dark:border-gray-600/30 rounded-full animate-float opacity-20"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-gray-200/30 dark:border-gray-600/30 rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/50 dark:from-transparent dark:via-gray-800/50 dark:to-gray-900/50"></div>
      </div>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-28 z-10">
        <div className="max-w-4xl w-full mx-auto text-center space-y-8">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
            <img 
              src="/logo4.png" 
              alt="ActionPipe Logo" 
              className="w-48 h-48 mx-auto object-contain rounded-xl shadow-xl"
            />
          </div>
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <span className="font-playfair italic font-light text-gray-900 dark:text-white">
                Real Conversations.
              </span>
              <br />
              <span className="font-inter font-extralight mt-2 block text-gray-800 dark:text-gray-200">
                <FlipWords 
                  words={["Virtual Avatar.","AI Companion.", "Smart Assistant.", "Online Friend"]} 
                  duration={2500}
                  className="text-gray-800 dark:text-gray-200"
                />
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-inter font-thin">
              Experience natural conversations with our AI avatar technology. Minimalist design, maximum impact.
            </p>
          </div>
          
          {/* Features Section with clean white cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Speech className="font-playfair italic text-xl font-light text-gray-700 dark:text-gray-300"></Speech>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-gray-900 dark:text-white">Lifelike Interaction</h3>
                <p className="font-inter text-sm font-light text-gray-600 dark:text-gray-400">Natural conversations with responsive AI technology.</p>
              </div>
            </div>
            
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <SquareMousePointer className="font-playfair italic text-xl font-light text-gray-700 dark:text-gray-300"></SquareMousePointer>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-gray-900 dark:text-white">Minimalist Design</h3>
                <p className="font-inter text-sm font-light text-gray-600 dark:text-gray-400">Clean aesthetics for distraction-free experiences.</p>
              </div>
            </div>
            
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Move className="font-playfair italic text-xl font-light text-gray-700 dark:text-gray-300"></Move>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-gray-900 dark:text-white">Intuitive Controls</h3>
                <p className="font-inter text-sm font-light text-gray-600 dark:text-gray-400">Seamless experience with simple, accessible controls.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg" 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full px-8 text-lg gap-2 group font-inter font-light"
              onClick={() => setIsApiDialogOpen(true)}
            >
              <Play className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              Configure API
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full px-8 text-lg group font-inter font-light"
              onClick={handleStartExperience}
            >
              Start Experience
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>

      {/* API Input Dialog */}
      <ApiInputDialog 
        open={isApiDialogOpen} 
        onOpenChange={setIsApiDialogOpen} 
      />
      
      <footer className="w-full overflow-hidden">
        <div className="h-[40vh] w-full max-w-[90vw] mx-auto">
          <TextHoverEffect
            text="Action Pipe"
            duration={0.3}
          />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
