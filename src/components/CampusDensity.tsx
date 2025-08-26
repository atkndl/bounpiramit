import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCampusDensity, DensityStatus } from "@/hooks/useCampusDensity";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Users, Clock } from "lucide-react";
import { useState } from "react";

const statusConfig = {
  very_crowded: {
    label: 'Çok Yoğun',
    color: 'bg-red-500 text-white',
    icon: '🔴'
  },
  normal: {
    label: 'Normal',
    color: 'bg-orange-500 text-white',
    icon: '🟠'
  },
  available: {
    label: 'Müsait',
    color: 'bg-green-500 text-white',
    icon: '🟢'
  },
  closed: {
    label: 'Kapalı',
    color: 'bg-gray-500 text-white',
    icon: '⚫'
  }
};

export const CampusDensity = () => {
  const { densityData, loading, updateDensityStatus } = useCampusDensity();
  const { user, isAdmin } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (areaId: string, newStatus: DensityStatus) => {
    setUpdating(areaId);
    await updateDensityStatus(areaId, newStatus);
    setUpdating(null);
  };

  const formatUpdateTime = (updatedAt: string) => {
    const date = new Date(updatedAt);
    return date.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Yoğunluk</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <span>Yoğunluk</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {densityData.map((area) => {
            const config = statusConfig[area.status];
            const isUpdatingThis = updating === area.id;
            
            return (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate mb-1">
                    {area.area_name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${config.color} text-xs px-2 py-1`}>
                      <span className="mr-1">{config.icon}</span>
                      {config.label}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatUpdateTime(area.updated_at)}
                    </div>
                  </div>
                </div>

                {isAdmin && user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0"
                        disabled={isUpdatingThis}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border shadow-md">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusUpdate(area.id, status as DensityStatus)}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <span className="mr-2">{config.icon}</span>
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};