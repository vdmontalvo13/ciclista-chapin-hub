import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  discipline: string;
  event_type: string;
  description: string | null;
  image_url: string | null;
  registration_link: string | null;
  organizer_id: string;
  is_published: boolean;
}

interface Category {
  id: string;
  name: string;
  age_range: string;
  price: number;
  distance: number | null;
  elevation: number | null;
}

const RaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOrganizer, isSuperAdmin } = useUserRole();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      if (user) {
        checkRegistration();
      }
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id!)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('event_categories')
        .select('*')
        .eq('event_id', id!)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error("Error al cargar el evento");
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('status')
        .eq('event_id', id!)
        .eq('cyclist_id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setIsRegistered(true);
        setRegistrationStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para inscribirte");
      navigate('/auth');
      return;
    }

    if (!selectedCategory && categories.length > 0) {
      toast.error("Selecciona una categoría");
      return;
    }

    // If there's an external registration link, redirect to it
    if (event?.registration_link) {
      window.open(event.registration_link, '_blank');
      return;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: id!,
          cyclist_id: user.id,
          category_id: selectedCategory || null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success("Inscripción enviada exitosamente. Espera la aprobación del organizador.");
      setIsRegistered(true);
      setRegistrationStatus('pending');
    } catch (error: any) {
      console.error('Error registering:', error);
      if (error.code === '23505') {
        toast.error("Ya estás inscrito en este evento");
      } else {
        toast.error("Error al inscribirse");
      }
    }
  };

  const canManageEvent = user && event && (event.organizer_id === user.id || isSuperAdmin);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Evento no encontrado</p>
          <Button onClick={() => navigate('/races')}>Volver a carreras</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <Link to="/races">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-background/20 backdrop-blur-sm hover:bg-background/40"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </Link>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="mb-2" variant="default">
            {event.discipline}
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">{event.title}</h1>
          <p className="text-white/90 text-sm">{event.event_type}</p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(event.event_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="font-medium">{event.event_time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {event.description && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-3">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>
        )}

        {categories.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-3">Categorías</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <p className="text-sm text-muted-foreground">{category.age_range}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Q{category.price}</p>
                      {category.distance && <p className="text-xs text-muted-foreground">{category.distance}km</p>}
                      {category.elevation && <p className="text-xs text-muted-foreground">{category.elevation}m</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {user && !canManageEvent && (
          <Card>
            <CardContent className="p-6 space-y-4">
              {isRegistered ? (
                <div className="text-center py-4">
                  <Badge 
                    variant={registrationStatus === 'approved' ? 'default' : registrationStatus === 'rejected' ? 'destructive' : 'secondary'}
                    className="text-lg px-4 py-2"
                  >
                    {registrationStatus === 'approved' && 'Inscripción Aprobada'}
                    {registrationStatus === 'pending' && 'Inscripción Pendiente'}
                    {registrationStatus === 'rejected' && 'Inscripción Rechazada'}
                  </Badge>
                </div>
              ) : (
                <>
                  {categories.length > 0 && !event.registration_link && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selecciona tu categoría</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Elige una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name} - {cat.age_range} - Q{cat.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button className="w-full" size="lg" onClick={handleRegistration}>
                    {event.registration_link ? (
                      <>
                        Inscribirse <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      'Inscribirse Ahora'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {canManageEvent && (
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => navigate(`/manage-registrations/${event.id}`)}
            >
              Gestionar Inscripciones
            </Button>
            <Button 
              className="flex-1"
              onClick={() => navigate(`/create-event?edit=${event.id}`)}
            >
              Editar Evento
            </Button>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default RaceDetail;
