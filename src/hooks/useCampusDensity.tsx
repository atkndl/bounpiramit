import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DensityStatus = 'very_crowded' | 'normal' | 'available' | 'closed';

export interface CampusDensity {
  id: string;
  area_name: string;
  status: DensityStatus;
  updated_at: string;
  updated_by?: string;
}

export const useCampusDensity = () => {
  const [densityData, setDensityData] = useState<CampusDensity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDensityData = async () => {
    try {
      const { data, error } = await supabase
        .from('campus_density')
        .select('*')
        .order('area_name');

      if (error) throw error;
      setDensityData((data as CampusDensity[]) || []);
    } catch (error) {
      console.error('Error fetching density data:', error);
      toast({
        title: "Hata",
        description: "Yoğunluk verileri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDensityStatus = async (areaId: string, newStatus: DensityStatus) => {
    try {
      const { error } = await supabase
        .from('campus_density')
        .update({ status: newStatus })
        .eq('id', areaId);

      if (error) throw error;

      // Update local state
      setDensityData(prev => 
        prev.map(item => 
          item.id === areaId 
            ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
            : item
        )
      );

      toast({
        title: "Başarılı",
        description: "Yoğunluk durumu güncellendi",
      });
    } catch (error) {
      console.error('Error updating density:', error);
      toast({
        title: "Hata",
        description: "Yoğunluk durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDensityData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('campus_density_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campus_density'
        },
        () => {
          fetchDensityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    densityData,
    loading,
    updateDensityStatus,
    refetch: fetchDensityData
  };
};