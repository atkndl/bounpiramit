import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDisplayName } from "@/hooks/useDisplayName";

interface ProfilePopoverProps {
  userId: string;
  children?: React.ReactNode;
  showTrigger?: boolean;
}

export function ProfilePopover({ userId, children, showTrigger = true }: ProfilePopoverProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { displayName, avatarUrl } = useDisplayName(userId);

  const handleSendMessage = () => {
    setOpen(false);
    navigate(`/mesajlar?userId=${userId}`);
  };

  const triggerContent = children || (
    showTrigger && (
      <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{displayName}</p>
          </div>
        </div>
        <Button 
          onClick={handleSendMessage}
          className="w-full"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Mesaj Gönder
        </Button>
      </PopoverContent>
    </Popover>
  );
}