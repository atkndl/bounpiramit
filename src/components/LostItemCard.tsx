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
      {/* Image with overlay badges */}
      <div className="relative aspect-video bg-muted">
        <ImageGallery 
          images={displayImages} 
          title={itemName}
        />
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={type === "lost" 
              ? "bg-orange-500/90 text-white border-0 backdrop-blur-sm" 
              : "bg-success/90 text-white border-0 backdrop-blur-sm"
            }
          >
            {type === "lost" ? "Kayıp" : "Bulundu"}
          </Badge>
        </div>
        {/* Bookmark button overlay */}
        {itemId && (
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(itemId, 'lost_item')}
              className={`bg-background/80 backdrop-blur-sm hover:bg-background/90 ${
                isBookmarked ? 'text-success hover:text-success' : 'text-muted-foreground'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Content section */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground mb-2">{itemName}</h3>
        
        {/* Location */}
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        
        {/* Date */}
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-4">
          <Calendar className="w-3 h-3" />
          <span>{timestamp}</span>
        </div>
        
        {/* User profile and contact */}
        {userId && (
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <ProfilePopover userId={userId} />
            <ContactPopover contactInfo={contactInfo}>
              <Button 
                size="sm" 
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <User className="w-4 h-4 mr-1" />
                İletişim
              </Button>
            </ContactPopover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}