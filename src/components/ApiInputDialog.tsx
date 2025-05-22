import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApiInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiInputDialog = ({ open, onOpenChange }: ApiInputDialogProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    localStorage.setItem("heygenApiKey", apiKey);
    toast.success("API key saved successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg border bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="font-playfair italic text-2xl">API Configuration</DialogTitle>
          <DialogDescription className="font-inter font-light text-muted-foreground">
            Enter your Heygen API key to enable avatar functionality
          </DialogDescription>
        </DialogHeader>
        
        
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="font-inter font-light">
              Heygen API Key
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="font-inter font-light bg-background/90 dark:bg-background/70"
            />

            <p className="text-xs text-muted-foreground font-inter font-light">
              Your API key is stored locally and never shared.
            </p>
            <a 
              href="https://app.heygen.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-light text-primary/80 hover:text-primary/90 transition-colors duration-200 flex items-center gap-1 mt-2"
            >
              Get API Key
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="font-inter font-light rounded-full"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveApiKey}
            className="rounded-full font-inter font-light"
          >
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiInputDialog;
