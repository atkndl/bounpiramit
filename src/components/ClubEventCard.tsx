import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, ExternalLink, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface ClubEventCardProps {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  eventDate: string;
  currentParticipants: number;
  maxParticipants: number | null;
  imageUrls?: string[] | null;
  detailUrl?: string | null;
  clubName: string;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  academic: "bg-blue-500",
  culture: "bg-purple-500", 
  technology: "bg-green-500",
  art: "bg-pink-500",
  sport: "bg-orange-500",
  club: "bg-primary",
  music: "bg-indigo-500",
  social: "bg-yellow-500",
  other: "bg-gray-500"
};

const categoryLabels: Record<string, string> = {
  academic: "Akademik",
  culture: "Kültür",
  technology: "Teknoloji", 
  art: "Sanat",
  sport: "Spor",
  club: "Kulüp",
  music: "Müzik",
  social: "Sosyal",
  other: "Diğer"
};

export function ClubEventCard({
  id,
  title,
  description,
  location,
  category,
  eventDate,
  currentParticipants,
  maxParticipants,
  imageUrls,
  detailUrl,
  clubName,
  onDelete
}: ClubEventCardProps) {
  const { isAdmin } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  
  const eventDateTime = parseISO(eventDate);
  const formattedDate = format(eventDateTime, "dd MMMM yyyy", { locale: tr });
  const formattedTime = format(eventDateTime, "HH:mm");

  const categoryColor = categoryColors[category] || categoryColors.other;
  const categoryLabel = categoryLabels[category] || "Diğer";

  const handleDetailClick = () => {
    if (detailUrl) {
      window.open(detailUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      onDelete(id);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-primary">
      <CardContent className="p-6">
        {/* Club Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src="/placeholder.svg" alt={clubName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {clubName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-muted-foreground">{clubName}</h4>
            <Badge 
              variant="secondary" 
              className={`${categoryColor} text-white text-xs px-2 py-1`}
            >
              {categoryLabel}
            </Badge>
          </div>
          {isAdmin && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Event Image - 16:9 aspect ratio */}
        {imageUrls && imageUrls.length > 0 && (
          <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: '16/9' }}>
            <img
              src={imageUrls[0]}
              alt={title}
              className={`w-full h-full object-contain bg-muted transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        )}

        {/* Event Title */}
        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span>{formattedTime}</span>
          </div>

          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Participants */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{currentParticipants}</span>
            {maxParticipants ? ` / ${maxParticipants}` : ''} katılımcı
          </div>
          {maxParticipants && (
            <div className="w-20 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentParticipants / maxParticipants) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Detail Button */}
        <Button
          onClick={handleDetailClick}
          disabled={!detailUrl}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Detaylar
        </Button>
      </CardContent>
    </Card>
  );
}