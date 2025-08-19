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
import { useToast } from "@/hooks/use-toast";

interface CreateLostItemDialogProps {
  onItemCreated: (data: { 
    itemName: string; 
    location: string; 
    contactInfo: string; 
    description: string; 
    type: "lost" | "found"; 
    images: string[] 
  }) => void;
}

export function CreateLostItemDialog({ onItemCreated }: CreateLostItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"lost" | "found">("lost");
  const [images, setImages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!itemName.trim() || !location.trim() || !contactInfo.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    
    onItemCreated({
      itemName: itemName.trim(),
      location: location.trim(),
      contactInfo: contactInfo.trim(),
      description: description.trim(),
      type,
      images
    });
    
    toast({
      title: "İlan başarıyla oluşturuldu!",
      description: `${type === "lost" ? "Kayıp" : "Bulundu"} ilanınız yayınlandı.`,
      className: "bg-success text-white",
    });
    
    // Reset form
    setItemName("");
    setLocation("");
    setContactInfo("");
    setDescription("");
    setType("lost");
    setImages([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-success to-green-400 hover:opacity-90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Kayıp Eşya İlanı Ekle
        </Button>
      </DialogTrigger>
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
                  />
                  <div className="text-center">
                    <ImagePlus className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Fotoğraf Ekle</span>
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
              className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90"
            >
              İlanı Yayınla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}