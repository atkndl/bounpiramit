import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building, MapPin, DollarSign, Clock, Upload } from "lucide-react";

interface CreateJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (job: any) => void;
}

export function CreateJobDialog({ isOpen, onClose, onCreateJob }: CreateJobDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "",
    workType: "",
    location: "",
    duration: "",
    salary: "",
    description: "",
    requirements: "",
    logo: "/placeholder.svg"
  });

  const jobTypes = ["Staj", "Part-time", "Full-time", "Freelance", "Proje Bazlı"];
  const workTypes = ["Uzaktan", "Ofis", "Hibrit"];
  const locations = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Diğer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.type || !formData.location || !formData.description) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    const job = {
      ...formData,
      requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req)
    };

    onCreateJob(job);
    
    toast({
      title: "Başarılı!",
      description: "İş ilanı başarıyla oluşturuldu.",
    });

    setFormData({
      title: "",
      company: "",
      type: "",
      workType: "",
      location: "",
      duration: "",
      salary: "",
      description: "",
      requirements: "",
      logo: "/placeholder.svg"
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Yeni İş İlanı
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Pozisyon Adı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Frontend Developer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Şirket Adı *
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="ABC Teknoloji"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">İş Türü *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="İş türü seç" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workType">Çalışma Şekli</Label>
              <Select value={formData.workType} onValueChange={(value) => setFormData({...formData, workType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Çalışma şekli seç" />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((type) => (
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
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Konum *
              </Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Şehir seç" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Süre
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="3 ay, Sürekli"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Maaş
              </Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder="15.000-20.000 TL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">İş Tanımı *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="İş tanımını ve sorumluluklarını detaylı bir şekilde açıklayın..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Gereksinimler</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              placeholder="React, TypeScript, Git, İngilizce..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Gereksinimleri virgülle ayırın</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Şirket Logosu
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Logo yüklemek için tıklayın</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG veya JPEG</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              İlan Yayınla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}