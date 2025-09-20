import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MemberProfile {
  user_id: string;
  full_name: string;
  department: string;
  year: number | null;
  avatar_url: string | null;
  directory_visibility: boolean;
}

export default function Rehber() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [myVisibility, setMyVisibility] = useState(true);
  const [userCanSeeDirectory, setUserCanSeeDirectory] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Fetch user's own visibility setting
  useEffect(() => {
    if (!user) return;

    const fetchUserVisibility = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('directory_visibility')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setMyVisibility(data.directory_visibility ?? true);
        setUserCanSeeDirectory(data.directory_visibility ?? true);
      }
    };

    fetchUserVisibility();
  }, [user]);

  // Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!userCanSeeDirectory) {
        setMembers([]);
        setFilteredMembers([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, department, year, avatar_url, directory_visibility')
        .eq('directory_visibility', true)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        toast.error('Üye listesi yüklenirken hata oluştu');
      } else {
        const validMembers = data?.filter(member => 
          member.full_name && 
          member.full_name.trim() !== '' && 
          member.full_name !== 'Anonim'
        ) || [];
        
        setMembers(validMembers);
        setFilteredMembers(validMembers);

        // Extract unique departments and years for filters
        const uniqueDepartments = [...new Set(validMembers
          .map(m => m.department)
          .filter(Boolean))] as string[];
        const uniqueYears = [...new Set(validMembers
          .map(m => m.year)
          .filter(Boolean))] as number[];

        setDepartments(uniqueDepartments.sort());
        setYears(uniqueYears.sort());
      }
      setIsLoading(false);
    };

    fetchMembers();
  }, [userCanSeeDirectory]);

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = members;

    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(member => member.year?.toString() === yearFilter);
    }

    setFilteredMembers(filtered);
  }, [searchQuery, departmentFilter, yearFilter, members]);

  // Update user's visibility setting
  const updateVisibility = async (visible: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ directory_visibility: visible })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating visibility:', error);
      toast.error('Görünürlük ayarı güncellenirken hata oluştu');
    } else {
      setMyVisibility(visible);
      setUserCanSeeDirectory(visible);
      toast.success(visible ? 'Artık rehberde görünüyorsunuz' : 'Rehberden gizlendiniz');
    }
  };

  const handleSendMessage = (userId: string) => {
    navigate(`/mesajlar?user=${userId}`);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header with visibility toggle */}
        <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Üye Rehberi</h1>
            <Badge variant="secondary" className="ml-auto">
              {filteredMembers.length} üye
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="visibility-toggle"
              checked={myVisibility}
              onCheckedChange={updateVisibility}
            />
            <Label htmlFor="visibility-toggle" className="text-sm font-medium">
              Rehberde görün
            </Label>
            <p className="text-xs text-muted-foreground">
              {myVisibility 
                ? 'Diğer üyeler sizi rehberde görebilir' 
                : 'Rehberden gizlendiniz, bu listeyi göremezsiniz'}
            </p>
          </div>
        </div>

        {/* Show content only if user is visible */}
        {!userCanSeeDirectory ? (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground">
                Rehberi görmek için görünürlüğünüzü açmanız gerekiyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search and filters */}
            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="İsim veya bölüm ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Filtreler:</Label>
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md bg-white"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md bg-white"
                >
                  <option value="">Tüm Sınıflar</option>
                  {years.map(year => (
                    <option key={year} value={year.toString()}>{year}. Sınıf</option>
                  ))}
                </select>

                {(searchQuery || departmentFilter || yearFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setDepartmentFilter('');
                      setYearFilter('');
                    }}
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
            </div>

            {/* Members list */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground mt-2">Yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.user_id} className="p-4 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {member.full_name}
                          </h3>
                          
                          {member.department && (
                            <p className="text-sm text-muted-foreground truncate">
                              {member.department}
                            </p>
                          )}
                          
                          {member.year && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {member.year}. Sınıf
                            </Badge>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={() => handleSendMessage(member.user_id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredMembers.length === 0 && (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-muted-foreground">
                    {searchQuery || departmentFilter || yearFilter 
                      ? 'Arama kriterlerinize uygun üye bulunamadı.'
                      : 'Henüz rehberde görünür üye bulunmuyor.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}