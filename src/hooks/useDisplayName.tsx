import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserDisplayInfo {
  displayName: string;
  showEmail: boolean;
  avatarUrl?: string | null;
  email?: string;
}

export function useDisplayName(userId: string | undefined) {
  const [displayInfo, setDisplayInfo] = useState<UserDisplayInfo>({
    displayName: 'Anonim',
    showEmail: false,
    avatarUrl: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserDisplay = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, name_display_style, email_visibility, avatar_url')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        const fullName = data?.full_name || 'Anonim';
        let displayName = fullName;

        // Apply name display style
        if (data?.name_display_style === 'abbreviated' && fullName && fullName !== 'Anonim') {
          const nameParts = fullName.split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastInitial = nameParts[nameParts.length - 1][0];
            displayName = `${firstName} ${lastInitial}.`;
          }
        }

        setDisplayInfo({
          displayName,
          showEmail: data?.email_visibility ?? true,
          avatarUrl: data?.avatar_url,
          email: data?.email
        });
      } catch (error) {
        console.error('Error fetching user display info:', error);
        setDisplayInfo({
          displayName: 'Anonim',
          showEmail: false,
          avatarUrl: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDisplay();
  }, [userId]);

  return { ...displayInfo, isLoading };
}