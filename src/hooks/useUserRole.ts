import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'super_admin' | 'organizer' | 'cyclist' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, status')
          .eq('user_id', user.id);

        if (error) throw error;

        // Filter approved roles (cyclists are auto-approved)
        const approvedRoles = data
          ?.filter(r => r.role === 'cyclist' || r.status === 'approved')
          .map(r => r.role as UserRole) || [];
        
        setRoles(approvedRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Subscribe to role changes
    const subscription = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isSuperAdmin = hasRole('super_admin');
  const isOrganizer = hasRole('organizer') || hasRole('super_admin');
  const isCyclist = hasRole('cyclist');

  return {
    roles,
    loading,
    hasRole,
    isSuperAdmin,
    isOrganizer,
    isCyclist,
  };
};
