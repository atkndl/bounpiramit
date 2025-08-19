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

export function CreatePostDialog() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
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
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button variant="ghost" size="sm" className="text-primary">
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