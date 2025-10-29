import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-cycling.jpg";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  discipline: string;
  event_type: string;
  image_url: string | null;
}

const Index = () => {
  const [upcomingRaces, setUpcomingRaces] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalCyclists: 0,
    totalLocations: 0,
  });

  useEffect(() => {
    fetchUpcomingRaces();
    fetchStats();
  }, []);

  const fetchUpcomingRaces = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, location, discipline, event_type, image_url')
        .eq('is_published', true)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(4);

      if (error) throw error;
      setUpcomingRaces(data || []);
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('event_date', today);

      const { count: cyclistsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { data: locationsData } = await supabase
        .from('events')
        .select('location')
        .eq('is_published', true);

      const uniqueLocations = new Set(locationsData?.map(e => e.location) || []).size;

      setStats({
        totalEvents: eventsCount || 0,
        totalCyclists: cyclistsCount || 0,
        totalLocations: uniqueLocations,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={heroImage} alt="Cycling in Guatemala" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              El Ciclista Chapín
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-xl">
              Descubre y participa en las mejores carreras de ciclismo
            </p>
            <Link to="/races">
              <Button size="lg" className="gap-2 shadow-lg">
                Ver Carreras
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
              <p className="text-xs text-muted-foreground">Carreras</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalCyclists}</p>
              <p className="text-xs text-muted-foreground">Ciclistas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-accent/20">
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalLocations}</p>
              <p className="text-xs text-muted-foreground">Ubicaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Races */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Próximas Carreras</h2>
            <Link to="/races">
              <Button variant="ghost" className="gap-2">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {upcomingRaces.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay carreras próximas disponibles</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingRaces.map((race) => (
                <Link key={race.id} to={`/race/${race.id}`}>
                  <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={race.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop'}
                        alt={race.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 right-3" variant="default">
                        {race.discipline}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {race.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <span>{new Date(race.event_date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-secondary" />
                          <span>{race.location}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          {race.event_type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Index;
