import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Phone, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { ReactNode } from "react";

interface ContactPopoverProps {
  contactInfo: string;
  children?: ReactNode;
  buttonSize?: "sm" | "default" | "lg";
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function ContactPopover({ 
  contactInfo, 
  children, 
  buttonSize = "sm",
  buttonVariant = "default"
}: ContactPopoverProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("İletişim bilgisi kopyalandı!");
  };

  const handleDirectContact = (info: string) => {
    if (info.includes('@')) {
      window.open(`mailto:${info}?subject=İletişim&body=Merhaba, ilanınız hakkında bilgi almak istiyorum.`);
    } else {
      window.location.href = `tel:${info}`;
    }
  };

  if (!contactInfo) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button 
            size={buttonSize} 
            variant={buttonVariant}
            className="bg-primary hover:bg-primary/80 text-primary-foreground border-primary/20 hover:border-primary/40"
          >
            <Phone className="w-4 h-4 mr-1" />
            İletişim
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">İletişim Bilgisi</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm break-all flex-1 mr-2">{contactInfo}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => copyToClipboard(contactInfo)}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDirectContact(contactInfo)}
                className="flex-1"
              >
                {contactInfo.includes('@') ? (
                  <>
                    <Mail className="w-4 h-4 mr-1" />
                    E-posta Gönder
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-1" />
                    Ara
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}