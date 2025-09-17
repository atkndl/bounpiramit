import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Plus } from "lucide-react";
import { useLostItems } from "@/hooks/useLostItems";
import { supabase } from "@/integrations/supabase/client";

interface CreateLostItemDialogProps {
  onItemCreated?: () => void; // Optional callback for refresh
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateLostItemDialog({ onItemCreated, children, open: externalOpen, onOpenChange }: CreateLostItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"lost" | "found">("found");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { createLostItem } = useLostItems();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `lost-items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls].slice(0, 5)); // Max 5 images
      
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!itemName.trim() || !location.trim() || !contactInfo.trim()) {
      return;
    }
    
    setUploading(true);
    const success = await createLostItem({
      title: itemName.trim(),
      description: description.trim(),
      location_lost: location.trim(),
      contact_info: contactInfo.trim(),
      item_type: type,
      image_urls: images.length > 0 ? images : undefined,
    });

    if (success) {
      // Reset form
      setItemName("");
      setLocation("");
      setContactInfo("");
      setDescription("");
      setType("found");
      setImages([]);
      setOpen(false);
      
      // Call the callback to refresh the list if provided
      if (onItemCreated) {
        onItemCreated();
      }
    }
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kayıp Eşya İlanı Oluştur</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Durum *</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as "lost" | "found")}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer">
                  Kaybettim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="cursor-pointer">
                  Buldum
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Eşya Adı *</Label>
            <Input
              id="itemName"
              placeholder="Örn: iPhone 13 Pro, Matematik kitabı, Cüzdan..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              {type === "lost" ? "Son Görülen Konum *" : "Bulunduğu Konum *"}
            </Label>
            <Input
              id="location"
              placeholder="Örn: Güney Kampüs Kütüphanesi, ETA Binası, Hisar Boyu..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact">İletişim Bilgisi *</Label>
            <Input
              id="contact"
              placeholder="E-posta adresiniz (@std.bogazici.edu.tr)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Eşya hakkında detaylı bilgi verin (renk, marka, özellikler, vs.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Eşya Görselleri</Label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Eşya ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="text-center">
                    <ImagePlus className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">
                      {uploading ? "Yükleniyor..." : "Fotoğraf Ekle"}
                    </span>
                  </div>
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              En fazla 5 fotoğraf ekleyebilirsiniz
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading}
              className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90"
            >
              {uploading ? "Yükleniyor..." : "İlanı Yayınla"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}