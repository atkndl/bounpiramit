import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Phone } from "lucide-react";

interface LostItemCardProps {
  itemName: string;
  location: string;
  timestamp: string;
  type: "lost" | "found";
  contactInfo: string;
  description: string;
  imageUrl?: string;
}

export function LostItemCard({
  itemName,
  location,
  timestamp,
  type,
  contactInfo,
  description,
  imageUrl,
}: LostItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1">
      {imageUrl && (
        <div className="aspect-video bg-muted">
          <img 
            src={imageUrl} 
            alt={itemName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{itemName}</h3>
          <Badge 
            className={type === "lost" ? "bg-orange-100 text-orange-800" : "bg-success text-white"}
          >
            {type === "lost" ? "Kayıp" : "Bulundu"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Phone className="w-4 h-4 mr-1" />
            İletişim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}