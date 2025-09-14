import { Search, ShoppingBag, Home, Calendar, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateLostItemDialog } from "./CreateLostItemDialog";
import { CreateMarketplaceDialog } from "./CreateMarketplaceDialog";
import { CreateHomeListingDialog } from "./CreateHomeListingDialog";
import { CreateEventDialog } from "./CreateEventDialog";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

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
      <CreateLostItemDialog onItemCreated={handleDialogClose}>
        <Dialog open={activeDialog === "lost-item"} onOpenChange={handleDialogClose}>
          <DialogContent>
            {/* Content will be rendered by CreateLostItemDialog */}
          </DialogContent>
        </Dialog>
      </CreateLostItemDialog>
      
      <CreateMarketplaceDialog onItemCreated={handleDialogClose}>
        <Dialog open={activeDialog === "marketplace"} onOpenChange={handleDialogClose}>
          <DialogContent>
            {/* Content will be rendered by CreateMarketplaceDialog */}
          </DialogContent>
        </Dialog>
      </CreateMarketplaceDialog>

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
    </>
  );
}