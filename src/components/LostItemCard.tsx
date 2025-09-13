import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, Bookmark } from "lucide-react";
import { ContactPopover } from "@/components/ContactPopover";
import { ImageGallery } from "@/components/ImageGallery";
import { ProfilePopover } from "@/components/ProfilePopover";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useFavorites } from "@/hooks/useFavorites";

interface LostItemCardProps {
  itemName: string;
  location: string;
  timestamp: string;
  type: "lost" | "found";
  contactInfo: string;
  description: string;
  imageUrls?: string[];
  userId?: string;
  itemId?: string;
}

export function LostItemCard({
  itemName,
  location,
  timestamp,
  type,
  contactInfo,
  description,
  imageUrls = [],
  userId,
  itemId,
}: LostItemCardProps) {
  const { displayName } = useDisplayName(userId || "");
  const { favorites, toggleFavorite } = useFavorites();
  const isBookmarked = itemId ? favorites.some(fav => fav.item_id === itemId && fav.item_type === 'lost_item') : false;
  const displayImages = (imageUrls && imageUrls.length > 0) ? imageUrls : ["/placeholder.svg"];
  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-2 border-border/40 hover:border-border/60">
      <div className="aspect-video bg-muted">
        <ImageGallery 
          images={displayImages} 
          title={itemName}
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{itemName}</h3>
          <Badge 
            className={type === "lost" ? "bg-orange-100 text-orange-800" : "bg-success text-white"}
          >
            {type === "lost" ? "Kayıp" : "Bulundu"}
          </Badge>
        </div>
        {userId && (
          <div className="flex items-center space-x-2 mt-2">
            <ProfilePopover userId={userId} />
            <span className="text-sm text-muted-foreground">{displayName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
          <div className="flex gap-2">
            {itemId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(itemId, 'lost_item')}
                className={isBookmarked ? 'text-success hover:text-success' : 'text-muted-foreground'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}
            <ContactPopover contactInfo={contactInfo}>
              <Button 
                size="sm" 
                variant="outline"
                className="border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="w-4 h-4 mr-1" />
                İletişim
              </Button>
            </ContactPopover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}