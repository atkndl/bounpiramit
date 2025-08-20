import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Calendar, ShoppingBag } from "lucide-react";
import { CreateLostItemDialog } from "./CreateLostItemDialog";
import { CreateMarketplaceDialog } from "./CreateMarketplaceDialog";
import { CreateSportsActivityDialog } from "./CreateSportsActivityDialog";
import { CreateHomeListingDialog } from "./CreateHomeListingDialog";
import { useNavigate } from "react-router-dom";
import { useSportsActivities } from "@/hooks/useSportsActivities";
import { useHousing } from "@/hooks/useHousing";
import { useState } from "react";

const quickActions = [
  {
    title: "Kayıp Eşya Bildir",
    icon: Search,
    description: "Kaybettiğin veya bulduğun eşyayı bildir",
    color: "bg-gradient-to-r from-primary to-primary-light",
  },
  {
    title: "Etkinlik Ekle",
    icon: Calendar,
    description: "Yeni bir etkinlik oluştur",
    color: "bg-gradient-to-r from-primary-light to-primary-glow",
  },
  {
    title: "İlan Ver",
    icon: Plus,
    description: "Satış, kiralık veya diğer ilanlarını paylaş",
    color: "bg-gradient-to-r from-success to-green-400",
  },
  {
    title: "Eşya Sat",
    icon: ShoppingBag,
    description: "İkinci el eşyalarını sat",
    color: "bg-gradient-to-r from-orange-400 to-orange-500",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { createActivity } = useSportsActivities();
  const { createItem } = useHousing();
  const [sportsDialogOpen, setSportsDialogOpen] = useState(false);
  const [housingDialogOpen, setHousingDialogOpen] = useState(false);

  const handleCreateSportsActivity = async (activityData: any) => {
    await createActivity(activityData);
    setSportsDialogOpen(false);
  };

  const handleCreateHouseListing = async (listingData: any) => {
    await createItem(listingData);
    setHousingDialogOpen(false);
  };

  return (
    <Card className="p-6 mb-8 shadow-card">
      <h2 className="text-xl font-semibold text-foreground mb-4">Hızlı Erişim</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          if (action.title === "Kayıp Eşya Bildir") {
            return (
              <CreateLostItemDialog key={action.title}>
                <Button
                  variant="outline"
                  className={`${action.color} text-white border-0 hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center p-6 h-auto w-full`}
                >
                  <action.icon className="w-8 h-8 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1">{action.description}</div>
                  </div>
                </Button>
              </CreateLostItemDialog>
            );
          }
          
          if (action.title === "Eşya Sat") {
            return (
              <CreateMarketplaceDialog key={action.title}>
                <Button
                  variant="outline"
                  className={`${action.color} text-white border-0 hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center p-6 h-auto w-full`}
                >
                  <action.icon className="w-8 h-8 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1">{action.description}</div>
                  </div>
                </Button>
              </CreateMarketplaceDialog>
            );
          }

          if (action.title === "Etkinlik Ekle") {
            return (
              <div key={action.title}>
                <Button
                  variant="outline"
                  className={`${action.color} text-white border-0 hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center p-6 h-auto w-full`}
                  onClick={() => setSportsDialogOpen(true)}
                >
                  <action.icon className="w-8 h-8 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1">{action.description}</div>
                  </div>
                </Button>
              </div>
            );
          }

          if (action.title === "İlan Ver") {
            return (
              <div key={action.title}>
                <Button
                  variant="outline"
                  className={`${action.color} text-white border-0 hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center p-6 h-auto w-full`}
                  onClick={() => setHousingDialogOpen(true)}
                >
                  <action.icon className="w-8 h-8 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1">{action.description}</div>
                  </div>
                </Button>
              </div>
            );
          }

          return null;
        })}
      </div>
      
      <CreateSportsActivityDialog
        isOpen={sportsDialogOpen}
        onClose={() => setSportsDialogOpen(false)}
        onCreateActivity={handleCreateSportsActivity}
      />
      
      <CreateHomeListingDialog
        open={housingDialogOpen}
        onOpenChange={setHousingDialogOpen}
        onSubmit={handleCreateHouseListing}
      />
    </Card>
  );
}