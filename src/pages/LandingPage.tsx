import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ApiInputDialog from "@/components/ApiInputDialog";
import { ShootingStars } from "@/components/ui/shooting-stars";

const LandingPage = () => {
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col relative overflow-hidden">
      {/* Shooting Stars Background */}
      <ShootingStars className="opacity-30" />
      
      {/* Background blur with blue shade, only affecting background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-50/20 rounded-full blur-3xl opacity-70 animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-50/20 rounded-full blur-3xl opacity-90 animate-pulse-soft"></div>
      </div>
      
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-28 z-10">
        <div className="max-w-4xl w-full mx-auto text-center space-y-8">
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <span className="font-playfair italic font-light text-white">
                Real Conversations.
              </span>
              <br />
              <span className="font-inter font-extralight mt-2 block text-gray-200">Virtual Avatar.</span>
            </h1>
          </div>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-inter font-thin">
              Experience natural conversations with our AI avatar technology. Minimalist design, maximum impact.
            </p>
          </div>
          
          {/* Features Section with clean white cards (no blue tint) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-800 bg-gray-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-50/5 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="font-playfair italic text-xl font-light text-gray-200">01</span>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-white">Lifelike Interaction</h3>
                <p className="font-inter text-sm font-light text-gray-400">Natural conversations with responsive AI technology.</p>
              </div>
            </div>
            
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-800 bg-gray-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-50/5 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="font-playfair italic text-xl font-light text-gray-200">02</span>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-white">Minimalist Design</h3>
                <p className="font-inter text-sm font-light text-gray-400">Clean aesthetics for distraction-free experiences.</p>
              </div>
            </div>
            
            <div className="relative hover:scale-105 transition-transform duration-300 p-6 rounded-xl backdrop-blur-sm border border-gray-800 bg-gray-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-50/5 opacity-50 rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="font-playfair italic text-xl font-light text-gray-200">03</span>
                </div>
                <h3 className="font-playfair italic text-xl mb-2 text-white">Intuitive Controls</h3>
                <p className="font-inter text-sm font-light text-gray-400">Seamless experience with simple, accessible controls.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 rounded-full px-8 text-lg gap-2 group font-inter font-light"
              onClick={() => setIsApiDialogOpen(true)}
            >
              <Play className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              Configure API
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 text-lg group font-inter font-light"
              asChild
            >
              <Link to="/app">
                Start Experience
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* API Input Dialog */}
      <ApiInputDialog 
        open={isApiDialogOpen} 
        onOpenChange={setIsApiDialogOpen} 
      />
    </div>
  );
};

export default LandingPage;
