import { useAppContext } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_LETTER_MESSAGE,
  DEFAULT_LETTER_SIGNATURE,
  DEFAULT_LETTER_TO,
} from "@/lib/constant";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "react-use";

export default function Share() {
  const { saveCanvas, letter } = useAppContext();
  const [toName, setToName] = useState(letter.to ?? DEFAULT_LETTER_TO);
  const [fromName, setFromName] = useState(
    letter.from ?? DEFAULT_LETTER_SIGNATURE
  );
  const [message, setMessage] = useState(
    letter.message ?? DEFAULT_LETTER_MESSAGE
  );
  const [_isEditable, setIsEditable] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [, cancel] = useDebounce(
    () => {
      cancel();
      if (toName || fromName || message) {
        saveCanvas.mutate({
          letter: {
            to: toName,
            from: fromName,
            message,
          },
        });
      }
    },
    1000,
    [toName, fromName, message]
  );

  const generateShareLink = () => {
    const searchParams = new URLSearchParams();
    searchParams.set("isEditable", _isEditable.toString());

    // Get the current URL and replace the search params
    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    return url.toString();
  };

  const handleCopy = async () => {
    // Save the current state before copying
    await saveCanvas.mutateAsync({
      letter: {
        to: toName,
        from: fromName,
        message,
      },
    });

    navigator.clipboard.writeText(generateShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-full h-10 pl-4 pr-1 relative flex justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        {saveCanvas.isPending && (
          <span className="text-sm text-gray-500 animate-pulse">Saving...</span>
        )}
        {!saveCanvas.isPending && (
          <span className="text-sm text-gray-500">Saved</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">Share</Button>
        </DialogTrigger>
        <DialogPortal>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share your gift</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 pb-0">
              <div className="grid gap-2">
                <Label htmlFor="to">Greeting</Label>
                <Input
                  id="to"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="Recipient's name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="from">Signature</Label>
                <Input
                  id="from"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="min-h-[200px] resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editable">Allow editing</Label>
                <Switch
                  id="editable"
                  checked={_isEditable}
                  onCheckedChange={setIsEditable}
                />
              </div>
              <div className="pt-4 flex items-center gap-2">
                <Input
                  readOnly
                  value={generateShareLink()}
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleCopy}
                  className="transition-all duration-200 w-9 h-9 flex-shrink-0"
                  disabled={saveCanvas.isPending}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
