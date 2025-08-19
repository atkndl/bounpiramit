import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Tag, ExternalLink } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  content: string;
  category: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
  isNew?: boolean;
}

export function AnnouncementCard({
  title,
  content,
  category,
  timestamp,
  priority = "medium",
  isNew = false,
}: AnnouncementCardProps) {
  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <Card className="hover:shadow-card transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-primary border-primary">
              <Tag className="w-3 h-3 mr-1" />
              {category}
            </Badge>
            {isNew && (
              <Badge className="bg-success text-white">Yeni</Badge>
            )}
          </div>
          <Badge className={priorityColors[priority]}>
            {priority === "high" ? "Önemli" : priority === "medium" ? "Normal" : "Düşük"}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg text-foreground leading-tight">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {content}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary-light"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Detay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}