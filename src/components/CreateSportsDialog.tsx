import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Users, Trophy, Upload } from "lucide-react";

interface CreateSportsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateActivity: (activity: any) => void;
}

export function CreateSportsDialog({ isOpen, onClose, onCreateActivity }: CreateSportsDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "",
    organizer: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    description: "",
    tags: "",
    image: "/placeholder.svg"
  });

  const categories = ["Futbol", "Basketbol", "Tenis", "Yüzme", "Yoga", "Fitness", "Fotoğrafçılık", "Müzik", "Sanat", "Teknoloji"];
  const types = ["Turnuva", "Etkinlik", "Hobi", "Kurs", "Workshop"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.type || !formData.date || !formData.time || !formData.location) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    const activity = {
      ...formData,
      participants: `0/${formData.maxParticipants || '20'}`,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onCreateActivity(activity);
    
    toast({
      title: "Başarılı!",
      description: "Etkinlik başarıyla oluşturuldu.",
    });

    setFormData({
      title: "",
      category: "",
      type: "",
      organizer: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: "",
      description: "",
      tags: "",
      image: "/placeholder.svg"
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Yeni Spor & Hobi Etkinliği
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
                placeholder="Etkinlik adını girin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizatör</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                placeholder="Organizatör adı"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
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
              <Label htmlFor="type">Tür *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
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
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarih *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Saat *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Katılımcı
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                placeholder="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Konum *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Etkinlik konumu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Etkinlik hakkında detaylar..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="etiket1, etiket2, etiket3..."
            />
            <p className="text-sm text-muted-foreground">Etiketleri virgülle ayırın</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Etkinlik Görseli
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Görsel yüklemek için tıklayın</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG veya JPEG</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Etkinlik Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}