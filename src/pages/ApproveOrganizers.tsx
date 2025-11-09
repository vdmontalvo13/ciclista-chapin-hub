import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

interface OrganizerRequest {
  id: string;
  user_id: string;
  requested_at: string;
  profiles: {
    full_name: string;
    email: string;
    photo_url: string | null;
    city: string;
  };
}

const ApproveOrganizers = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useUserRole();
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPendingRequests();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchPendingRequests = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, requested_at')
        .eq('role', 'organizer')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Fetch profiles separately
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, photo_url, city')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combined = rolesData.map(role => {
        const profile = profilesData?.find(p => p.id === role.user_id);
        return {
          ...role,
          profiles: profile || {
            full_name: 'Usuario',
            email: '',
            photo_url: null,
            city: ''
          }
        };
      });

      setRequests(combined as OrganizerRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Aprobado',
        description: 'El organizador ha sido aprobado exitosamente',
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la solicitud',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Rechazado',
        description: 'La solicitud ha sido rechazada',
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">
            Aprobar Organizadores
          </h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        {!isSuperAdmin ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No tienes permisos para acceder a esta página
              </p>
            </CardContent>
          </Card>
        ) : loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No hay solicitudes pendientes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={request.profiles.photo_url || ''} />
                      <AvatarFallback>
                        {request.profiles.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {request.profiles.full_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.profiles.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{request.profiles.city}</Badge>
                        <Badge variant="outline">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default ApproveOrganizers;
