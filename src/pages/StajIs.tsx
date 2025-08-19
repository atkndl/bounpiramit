import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { Plus, Search, Briefcase, Building, Clock, MapPin, DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const jobListings = [
  {
    id: 1,
    title: "Frontend Developer Stajı",
    company: "TechCorp",
    type: "Staj",
    location: "İstanbul",
    workType: "Hibrit",
    duration: "3 ay",
    salary: "Ücretli",
    description: "React ve TypeScript kullanarak modern web uygulamaları geliştirme stajı.",
    requirements: ["React", "TypeScript", "CSS", "Git"],
    logo: "/placeholder.svg",
    postedDate: "2 gün önce",
    applications: 24,
    views: 156
  },
  {
    id: 2,
    title: "Marketing Uzmanı",
    company: "StartupXYZ",
    type: "Part-time",
    location: "İstanbul",
    workType: "Uzaktan",
    duration: "Sürekli",
    salary: "15.000-20.000 TL",
    description: "Dijital pazarlama kampanyaları yönetimi ve sosyal medya stratejileri.",
    requirements: ["SEO", "Google Ads", "Sosyal Medya", "Analytics"],
    logo: "/placeholder.svg",
    postedDate: "1 gün önce",
    applications: 18,
    views: 89
  },
  {
    id: 3,
    title: "UI/UX Designer Stajı",
    company: "Design Studio",
    type: "Staj",
    location: "İstanbul",
    workType: "Ofis",
    duration: "4 ay",
    salary: "Ücretli",
    description: "Kullanıcı deneyimi odaklı tasarım süreçlerinde yer alma fırsatı.",
    requirements: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    logo: "/placeholder.svg",
    postedDate: "3 gün önce",
    applications: 31,
    views: 203
  }
];

const jobTypes = ["Tümü", "Staj", "Part-time", "Full-time", "Freelance", "Proje Bazlı"];
const workTypes = ["Tümü", "Uzaktan", "Ofis", "Hibrit"];
const sectors = ["Tümü", "Teknoloji", "Pazarlama", "Tasarım", "Finans", "Eğitim", "Sağlık", "Mühendislik"];

export default function StajIs() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("Tümü");
  const [selectedWorkType, setSelectedWorkType] = useState("Tümü");
  const [selectedSector, setSelectedSector] = useState("Tümü");
  const [jobs, setJobs] = useState(jobListings);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === "Tümü" || job.type === selectedJobType;
    const matchesWorkType = selectedWorkType === "Tümü" || job.workType === selectedWorkType;
    
    return matchesSearch && matchesJobType && matchesWorkType;
  });

  const handleCreateJob = (newJob: any) => {
    const job = {
      id: jobs.length + 1,
      ...newJob,
      postedDate: "Şimdi",
      applications: 0,
      views: 0
    };
    setJobs([job, ...jobs]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              Staj & İş İlanları
            </h1>
            <p className="text-muted-foreground mt-1">Kariyerini şekillendirecek fırsatları keşfet</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary-light text-white hover:opacity-90 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlan Ekle
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Aktif İlan</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Toplam Başvuru</p>
                  <p className="text-2xl font-bold">73</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Bu Hafta</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Şirket</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Building className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="İş, şirket veya pozisyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger className="md:w-48">
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
              <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Çalışma şekli" />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Sektör seç" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="shadow-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={job.logo} alt={job.company} />
                        <AvatarFallback>{job.company[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>{job.workType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {job.type}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                        {job.workType}
                      </Badge>
                      {job.requirements.slice(0, 3).map((req) => (
                        <Badge key={req} variant="outline" className="text-xs">
                          #{req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} daha
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{job.postedDate}</span>
                        <span>•</span>
                        <span>{job.applications} başvuru</span>
                        <span>•</span>
                        <span>{job.views} görüntülenme</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Detaylar
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                          Başvur
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center shadow-card">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">İlan Bulunamadı</h3>
            <p className="text-muted-foreground">Aradığınız kriterlere uygun iş ilanı bulunmuyor.</p>
          </Card>
        )}
      </div>

      <CreateJobDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateJob={handleCreateJob}
      />
    </div>
  );
}