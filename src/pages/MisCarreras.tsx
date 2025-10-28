import { useState, useEffect } from 'react';
import { Trophy, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Race {
  id: string;
  title: string;
  event_date: string;
  location: string;
  event_type: string;
  discipline: string;
  image_url: string | null;
}

const MisCarreras = () => {
  const { user } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [pastRaces, setPastRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyRaces();
    }
  }, [user]);

  const fetchMyRaces = async () => {
    try {
      // Get approved registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select(`
          event_id,
          events (
            id,
            title,
            event_date,
            location,
            event_type,
            discipline,
            image_url
          )
        `)
        .eq('cyclist_id', user!.id)
        .eq('status', 'approved');

      if (regError) throw regError;

      const today = new Date().toISOString().split('T')[0];
      const races = registrations?.map(r => r.events).filter(Boolean) as Race[] || [];

      const upcoming = races.filter(r => r.event_date >= today);
      const past = races.filter(r => r.event_date < today);

      setUpcomingRaces(upcoming);
      setPastRaces(past);
    } catch (error) {
      console.error('Error fetching races:', error);
    } finally {
      setLoading(false);
    }
  };

  const RaceCard = ({ race }: { race: Race }) => (
    <Link to={`/race/${race.id}`}>
      <Card className="hover:shadow-hover transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {race.image_url && (
              <img
                src={race.image_url}
                alt={race.title}
                className="w-20 h-20 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{race.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(race.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{race.location}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{race.event_type}</Badge>
                <Badge variant="outline">{race.discipline}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-primary-foreground">Mis Carreras</h1>
      </div>
      
      <div className="container max-w-4xl mx-auto p-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Próximas ({upcomingRaces.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Resultados ({pastRaces.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {upcomingRaces.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tienes carreras próximas</p>
                  <p className="text-sm text-muted-foreground">
                    Ve a la sección de Carreras para inscribirte
                  </p>
                </div>
              ) : (
                upcomingRaces.map((race) => (
                  <RaceCard key={race.id} race={race} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4 mt-4">
              {pastRaces.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aún no tienes resultados</p>
                  <p className="text-sm text-muted-foreground">
                    Participa en carreras para ver tus resultados aquí
                  </p>
                </div>
              ) : (
                pastRaces.map((race) => (
                  <RaceCard key={race.id} race={race} />
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

export default MisCarreras;
