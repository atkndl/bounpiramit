import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Plus } from "lucide-react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { supabase } from "@/integrations/supabase/client";

interface CreateMarketplaceDialogProps {
  onItemCreated?: () => void;
  children?: React.ReactNode;
}

export const CreateMarketplaceDialog = ({ onItemCreated, children }: CreateMarketplaceDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState("new");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { createItem } = useMarketplace();

  const categories = [
    { value: "electronics", label: "Elektronik" },
    { value: "clothing", label: "Giyim" },
    { value: "books", label: "Kitap" },
    { value: "furniture", label: "Mobilya" },
    { value: "sports", label: "Spor" },
    { value: "other", label: "Diğer" },
  ];

  const conditions = [
    { value: "new", label: "Yeni" },
    { value: "like-new", label: "Sıfır Ayarında" },
    { value: "good", label: "İyi" },
    { value: "fair", label: "Orta" },
    { value: "poor", label: "Kötü" },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).slice(0, 5 - images.length).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `marketplace/${fileName}`;

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
      setImages(prev => [...prev, ...uploadedUrls].slice(0, 5));
      
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
    if (!title.trim() || !description.trim() || !price.trim()) {
      return;
    }
    
    setUploading(true);
    try {
      const success = await createItem({
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: parseFloat(price),
        image_urls: images,
      });

      if (success) {
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("electronics");
        setCondition("new");
        setPrice("");
        setImages([]);
        setOpen(false);
        
        if (onItemCreated) {
          onItemCreated();
        }
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Eşya İlanı Ekle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Eşya İlanı</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Örn: iPhone 13 Pro Max"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Durum *</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Fiyat (₺) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              placeholder="Eşyanızın detaylarını yazın..."
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Fotoğraflar (Maksimum 5)</Label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-0">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </CardContent>
                </Card>
              ))}
              {images.length < 5 && (
                <Card className="border-dashed">
                  <CardContent className="p-0">
                    <label className="flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-muted/50 rounded-lg">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Fotoğraf Ekle</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={uploading || !title.trim() || !description.trim() || !price.trim()}
            >
              {uploading ? "Yükleniyor..." : "İlanı Yayınla"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};