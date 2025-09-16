import { Search, ShoppingBag, Home, Calendar, MapPin, Briefcase, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateLostItemDialog } from "./CreateLostItemDialog";
import { CreateMarketplaceDialog } from "./CreateMarketplaceDialog";
import { CreateHomeListingDialog } from "./CreateHomeListingDialog";
import { CreateEventDialog } from "./CreateEventDialog";
import { CreateJobDialog } from "./CreateJobDialog";
import { CreateSportsActivityDialog } from "./CreateSportsActivityDialog";
import { useJobs } from "@/hooks/useJobs";
import { useSportsActivities } from "@/hooks/useSportsActivities";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { createJob } = useJobs();
  const { createActivity } = useSportsActivities();

  const listingTypes = [
    {
      id: "lost-item",
      title: "Kayıp Eşya İlanı",
      description: "Kayıp veya bulunan eşya ilanı ver",
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "marketplace",
      title: "Eşya Satış İlanı", 
      description: "Eşya sat veya değiş tokuş yap",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "housing",
      title: "Ev/Oda İlanı",
      description: "Oda kirala veya ev arkadaşı bul",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "event",
      title: "Etkinlik İlanı",
      description: "Etkinlik düzenle veya duyur",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: "job",
      title: "Staj & İş İlanı",
      description: "İş veya staj ilanı ver",
      icon: Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: "sports",
      title: "Hobi & Spor Etkinliği",
      description: "Spor veya hobi etkinliği düzenle",
      icon: Trophy,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  const handleListingTypeClick = (typeId: string) => {
    setActiveDialog(typeId);
    onClose();
  };

  const handleDialogClose = () => {
    setActiveDialog(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İlan Türü Seçin</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {listingTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="ghost"
                  className="h-auto p-4 flex items-start space-x-3 hover:bg-muted/50"
                  onClick={() => handleListingTypeClick(type.id)}
                >
                  <div className={`p-2 rounded-lg ${type.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{type.title}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Create Dialogs */}
      {activeDialog === "lost-item" && (
        <CreateLostItemDialog onItemCreated={handleDialogClose}>
          <div></div>
        </CreateLostItemDialog>
      )}
      
      {activeDialog === "marketplace" && (
        <CreateMarketplaceDialog onItemCreated={handleDialogClose}>
          <div></div>
        </CreateMarketplaceDialog>
      )}

      <CreateHomeListingDialog 
        open={activeDialog === "housing"}
        onOpenChange={(open) => !open && handleDialogClose()}
        onSubmit={handleDialogClose}
      />

      <CreateEventDialog 
        open={activeDialog === "event"}
        onOpenChange={(open) => !open && handleDialogClose()}
        onSubmit={handleDialogClose}
      />

      <CreateJobDialog 
        isOpen={activeDialog === "job"}
        onClose={handleDialogClose}
        onCreateJob={createJob}
      />

      <CreateSportsActivityDialog 
        isOpen={activeDialog === "sports"}
        onClose={handleDialogClose}
        onCreateActivity={createActivity}
      />
    </>
  );
}