import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { requestManager } from '@/lib/requestManager';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  job_type: string;
  location: string | null;
  requirements: string | null;
  salary_range: string | null;
  application_deadline: string | null;
  contact_info: string | null;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = async () => {
    const requestKey = 'jobs-list';
    
    try {
      return await requestManager.execute(requestKey, async () => {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setLoading(false);
        return data;
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setLoading(false);
      
      if (error instanceof Error && error.message === 'Session not loaded yet') {
        return; // Don't show error for session loading
      }
      
      toast({
        title: "Hata",
        description: "İş ilanları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const createJob = async (jobData: {
    title: string;
    company: string;
    description: string;
    job_type: string;
    location?: string;
    requirements?: string;
    salary_range?: string;
    application_deadline?: string;
    contact_info?: string;
  }) => {
    const requestKey = `create-job-${Date.now()}`;
    
    try {
      return await requestManager.execute(requestKey, async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('jobs')
          .insert([
            {
              ...jobData,
              user_id: user.id,
            }
          ])
          .select()
          .single();

        if (error) throw error;

        setJobs(prev => [data, ...prev]);
        toast({
          title: "Başarılı",
          description: "İş ilanı başarıyla oluşturuldu.",
        });

        return data;
      }, true); // Requires authentication
    } catch (error) {
      console.error('Error creating job:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Authentication required' || error.message === 'User not authenticated') {
          toast({
            title: "Hata",
            description: "Bu işlem için giriş yapmalısınız.",
            variant: "destructive",
          });
          throw error;
        }
        if (error.message === 'Session not loaded yet') {
          toast({
            title: "Hata",
            description: "Lütfen bekleyin...",
            variant: "destructive",
          });
          throw error;
        }
      }
      
      toast({
        title: "Hata",
        description: "İş ilanı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== id));
      toast({
        title: "Başarılı",
        description: "İş ilanı başarıyla silindi.",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Hata",
        description: "İş ilanı silinirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    createJob,
    deleteJob,
    refetch: fetchJobs,
  };
}