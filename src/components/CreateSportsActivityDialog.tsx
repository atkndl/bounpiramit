import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Trophy, Phone } from "lucide-react";
import { toast } from "sonner";

interface CreateSportsActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateActivity: (activity: any) => void;
}

export function CreateSportsActivityDialog({ isOpen, onClose, onCreateActivity }: CreateSportsActivityDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    activity_type: "",
    organizer: "",
    activity_date: "",
    activity_time: "",
    location: "",
    max_participants: "",
    description: "",
    contact_info: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Futbol", "Basketbol", "Tenis", "Yüzme", "Yoga", "Fitness", 
    "OKEY101", "Tavla", "Satranç", "Kutu Oyunu", 
    "Fotoğrafçılık", "Müzik", "Sanat", "Teknoloji"
  ];
  const types = ["Turnuva", "Etkinlik", "Hobi", "Kurs", "Workshop"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.activity_type || !formData.location || !formData.contact_info) {
      toast.error("Lütfen zorunlu alanları doldurun!");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateActivity({
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      });

      // Reset form
      setFormData({
        title: "",
        category: "",  
        activity_type: "",
        organizer: "",
        activity_date: "",
        activity_time: "",
        location: "",
        max_participants: "",
        description: "",
        contact_info: ""
      });
      
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            Hobi & Spor Etkinliği Ekle
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Etkinlik Adı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="örn: Satranç Turnuvası"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizatör</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                placeholder="Organizatör adı"
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity_type">Tür *</Label>
              <Select value={formData.activity_type} onValueChange={(value) => setFormData({...formData, activity_type: value})}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Tür seç" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarih
              </Label>
              <Input
                id="activity_date"
                type="date"
                value={formData.activity_date}
                onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Saat
              </Label>
              <Input
                id="activity_time"
                type="time"
                value={formData.activity_time}
                onChange={(e) => setFormData({...formData, activity_time: e.target.value})}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_participants" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Katılımcı
              </Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                placeholder="20"
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Konum *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="örn: Öğrenci Merkezi"
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_info" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                İletişim Bilgisi *
              </Label>
              <Input
                id="contact_info"
                value={formData.contact_info}
                onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                placeholder="isim.soyisim@std.bogazici.edu.tr"
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Etkinlik hakkında detaylar..."
              className="border-primary/20 focus:border-primary min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? "Yükleniyor..." : "Etkinlik Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}