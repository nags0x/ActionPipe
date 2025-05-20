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

    // Store API key in localStorage
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
              className="font-inter font-light"
            />
            <p className="text-xs text-muted-foreground font-inter font-light">
              Your API key is stored locally and never shared.
            </p>
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
