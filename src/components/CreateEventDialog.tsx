import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Calendar, MapPin, Users, Music } from "lucide-react";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onSubmit }: CreateEventDialogProps) {
  const { createEvent, uploadImage } = useEvents();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    category: "",
    maxAttendees: "",
    tags: "",
    image: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ["club", "music", "sports", "academic", "social", "other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description || !formData.category) {
      toast.error("Lütfen zorunlu alanları doldurun!");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrls: string[] = [];

      // Upload image if provided
      if (formData.image) {
        const imageUrl = await uploadImage(formData.image);
        imageUrls = [imageUrl];
      }

      // Combine date and time for event_date
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      await createEvent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        event_date: eventDateTime.toISOString(),
        max_participants: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined
      });

      // Reset form
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "",
        maxAttendees: "",
        tags: "",
        image: null
      });

      onOpenChange(false);
      onSubmit?.();
    } catch (error) {
      // Error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Görsel boyutu 5MB'dan küçük olmalıdır!");
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      toast.success("Görsel seçildi!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Music className="w-6 h-6 text-primary" />
            Eğlence & Festival Etkinliği Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Etkinlik Adı *</Label>
              <Input
                id="title"
                placeholder="örn: Bahar Festivali 2024"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiketler</Label>
              <Input
                id="tags"
                placeholder="örn: müzik, konser, eğlence (virgülle ayırın)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Konum *
              </Label>
              <Input
                id="location"
                placeholder="örn: Albert Long Hall"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarih *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Saat *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-2">
            <Label htmlFor="maxAttendees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maksimum Katılımcı
            </Label>
            <Input
              id="maxAttendees"
              type="number"
              placeholder="örn: 100"
              value={formData.maxAttendees}
              onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
              className="border-primary/20 focus:border-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Etkinlik Açıklaması *</Label>
            <Textarea
              id="description"
              placeholder="Etkinlik hakkında detaylı bilgi verin..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="border-primary/20 focus:border-primary min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Etkinlik Görseli
            </Label>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Görsel yüklemek için tıklayın
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="relative group max-w-xs">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {submitting ? "Yayınlanıyor..." : "Etkinlik Yayınla"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}