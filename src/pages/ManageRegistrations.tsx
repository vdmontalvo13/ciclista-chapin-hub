import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

interface Registration {
  id: string;
  cyclist_id: string;
  status: string;
  registered_at: string;
  profiles: {
    full_name: string;
    email: string;
    photo_url: string | null;
    city: string;
  };
  event_categories: {
    name: string;
    age_range: string;
  } | null;
}

const ManageRegistrations = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { isOrganizer } = useUserRole();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOrganizer) {
      navigate('/');
      return;
    }

    if (eventId) {
      fetchEventDetails();
      fetchRegistrations();
    }
  }, [isOrganizer, eventId, navigate]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId!)
        .single();

      if (error) throw error;
      setEventName(data.title);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data: regsData, error: regsError } = await supabase
        .from('registrations')
        .select('id, cyclist_id, category_id, status, registered_at')
        .eq('event_id', eventId!)
        .order('registered_at', { ascending: false });

      if (regsError) throw regsError;

      if (!regsData || regsData.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      // Fetch profiles separately
      const cyclistIds = regsData.map(r => r.cyclist_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, photo_url, city')
        .in('id', cyclistIds);

      // Fetch categories separately
      const categoryIds = regsData.map(r => r.category_id).filter(Boolean);
      const { data: categoriesData } = await supabase
        .from('event_categories')
        .select('id, name, age_range')
        .in('id', categoryIds);

      // Combine the data
      const combined = regsData.map(reg => {
        const profile = profilesData?.find(p => p.id === reg.cyclist_id);
        const category = categoriesData?.find(c => c.id === reg.category_id);
        return {
          ...reg,
          profiles: profile || {
            full_name: 'Usuario',
            email: '',
            photo_url: null,
            city: ''
          },
          event_categories: category || null
        };
      });

      setRegistrations(combined as Registration[]);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las inscripciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Aprobado',
        description: 'La inscripción ha sido aprobada',
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la inscripción',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'rejected' })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Rechazado',
        description: 'La inscripción ha sido rechazada',
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la inscripción',
        variant: 'destructive',
      });
    }
  };

  const pendingRegistrations = registrations.filter(r => r.status === 'pending');
  const approvedRegistrations = registrations.filter(r => r.status === 'approved');
  const rejectedRegistrations = registrations.filter(r => r.status === 'rejected');

  const RegistrationCard = ({ registration, showActions = false }: { registration: Registration, showActions?: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={registration.profiles.photo_url || ''} />
            <AvatarFallback>
              {registration.profiles.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {registration.profiles.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {registration.profiles.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{registration.profiles.city}</Badge>
              {registration.event_categories && (
                <Badge variant="outline">
                  {registration.event_categories.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {showActions && (
        <CardContent>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => handleApprove(registration.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleReject(registration.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              Gestionar Inscripciones
            </h1>
            <p className="text-sm text-primary-foreground/80">{eventName}</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pendientes ({pendingRegistrations.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprobadas ({approvedRegistrations.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rechazadas ({rejectedRegistrations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingRegistrations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No hay inscripciones pendientes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    showActions
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approvedRegistrations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No hay inscripciones aprobadas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                approvedRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedRegistrations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No hay inscripciones rechazadas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default ManageRegistrations;
