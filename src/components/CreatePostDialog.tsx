import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostDialogProps {
  onPostCreated: (data: { content: string; images: string[] }) => void;
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image upload clicked, files:", event.target.files);
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Processing", files.length, "files");
      const newImages = Array.from(files).map(file => {
        console.log("Processing file:", file.name, file.type, file.size);
        return URL.createObjectURL(file);
      });
      setImages(prev => {
        const updated = [...prev, ...newImages].slice(0, 4); // Max 4 images
        console.log("Updated images array:", updated);
        return updated;
      });
      toast({
        title: "Fotoğraflar eklendi",
        description: `${newImages.length} fotoğraf seçildi`,
        className: "bg-success text-white",
      });
    } else {
      console.log("No files selected or files is null");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (content.trim().length < 10) {
      toast({
        title: "Çok kısa paylaşım",
        description: "Paylaşımınız en az 10 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }
    
    onPostCreated({ content: content.trim(), images });
    
    toast({
      title: "Paylaşım başarılı!",
      description: "Paylaşımınız Piramit'te yayınlandı.",
      className: "bg-success text-white",
    });
    
    setContent("");
    setImages([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 cursor-pointer hover:shadow-card transition-all duration-300 border-2 border-dashed border-primary/30 hover:border-primary/50">
          <CardContent className="p-0">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-white">
                  Siz
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-muted-foreground">
                Bugün ne düşünüyorsun? Paylaş...
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Paylaşım</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-white">
                Siz
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Bugün ne düşünüyorsun? Arkadaşlarınla paylaş..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] border-0 resize-none p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Button clicked, triggering file input");
                    document.getElementById('image-upload')?.click();
                  }}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Fotoğraf Ekle
                </Button>
              </label>
              <span className="text-sm text-muted-foreground">
                {content.length}/280
              </span>
            </div>
            <Button 
              onClick={handlePost}
              disabled={content.trim().length === 0}
              className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90"
            >
              Paylaş
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}