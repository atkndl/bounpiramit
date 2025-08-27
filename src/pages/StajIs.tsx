import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Briefcase, Building, Clock, MapPin, DollarSign, Users, BookOpen, TrendingUp, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";

const jobTypes = ["Tümü", "internship", "part-time", "full-time", "freelance", "project"];
const workTypes = ["Tümü", "remote", "office", "hybrid"];
const sectors = ["Tümü", "Teknoloji", "Pazarlama", "Tasarım", "Finans", "Eğitim", "Sağlık", "Mühendislik"];

const jobTypeLabels: Record<string, string> = {
  "internship": "Staj",
  "part-time": "Part-time", 
  "full-time": "Full-time",
  "freelance": "Freelance",
  "project": "Proje Bazlı"
};

export default function StajIs() {
  const { isAdmin } = useAuth();
  const { jobs, loading, createJob, deleteJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("Tümü");
  const [selectedWorkType, setSelectedWorkType] = useState("Tümü");
  const [selectedSector, setSelectedSector] = useState("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === "Tümü" || job.job_type === selectedJobType;
    const matchesWorkType = selectedWorkType === "Tümü" || (job.location && job.location.toLowerCase().includes(selectedWorkType.toLowerCase()));
    
    return matchesSearch && matchesJobType && matchesWorkType;
  });

  const handleCreateJob = (newJob: any) => {
    createJob(newJob);
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      deleteJob(id);
    }
  };

  const totalApplications = jobs.reduce((sum, job) => sum + (Math.floor(Math.random() * 50) + 1), 0);
  const thisWeekJobs = jobs.filter(job => {
    const jobDate = new Date(job.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return jobDate >= weekAgo;
  }).length;
  const uniqueCompanies = new Set(jobs.map(job => job.company)).size;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Briefcase className="w-8 h-8 mr-3" />
            Staj & İş İlanları
          </h1>
          <p className="text-primary-foreground/90">
            Kariyerini şekillendirecek fırsatları keşfet
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                İş İlanı Ekle
              </Button>
            )}
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm">Aktif İlan</p>
                  <p className="text-lg md:text-2xl font-bold">{loading ? '...' : jobs.length}</p>
                </div>
                <Briefcase className="w-5 h-5 md:w-8 md:h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs md:text-sm">Toplam Başvuru</p>
                  <p className="text-lg md:text-2xl font-bold">{loading ? '...' : totalApplications}</p>
                </div>
                <Users className="w-5 h-5 md:w-8 md:h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm">Bu Hafta</p>
                  <p className="text-lg md:text-2xl font-bold">{loading ? '...' : thisWeekJobs}</p>
                </div>
                <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs md:text-sm">Şirket</p>
                  <p className="text-lg md:text-2xl font-bold">{loading ? '...' : uniqueCompanies}</p>
                </div>
                <Building className="w-5 h-5 md:w-8 md:h-8 text-orange-200" />
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
                      {type === "Tümü" ? type : jobTypeLabels[type] || type}
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
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="shadow-card hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="/placeholder.svg" alt={job.company} />
                          <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {job.company}
                          </p>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {job.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4 mr-2" />
                          <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {jobTypeLabels[job.job_type] || job.job_type}
                        </Badge>
                        {job.requirements && job.requirements.split(',').slice(0, 3).map((req) => (
                          <Badge key={req.trim()} variant="outline" className="text-xs">
                            #{req.trim()}
                          </Badge>
                        ))}
                        {job.requirements && job.requirements.split(',').length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.split(',').length - 3} daha
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
                          {job.application_deadline && (
                            <>
                              <span>•</span>
                              <span>Son başvuru: {new Date(job.application_deadline).toLocaleDateString('tr-TR')}</span>
                            </>
                          )}
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
        )}

        {!loading && filteredJobs.length === 0 && (
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