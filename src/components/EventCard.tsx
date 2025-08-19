import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface EventCardProps {
  title: string;
  clubName: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees?: number;
  category?: string;
}

export function EventCard({
  title,
  clubName,
  date,
  time,
  location,
  description,
  attendees,
  category,
}: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-primary border-primary">
            {clubName}
          </Badge>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg text-foreground leading-tight">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between pt-2">
          {attendees && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{attendees} katılımcı</span>
            </div>
          )}
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90">
            Katıl
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}