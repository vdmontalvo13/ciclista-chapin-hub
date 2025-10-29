import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import FilterBar from "@/components/FilterBar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  event_type: string;
  discipline: string;
  image_url: string | null;
}

const Races = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, eventTypeFilter, disciplineFilter, locationFilter, startDate, endDate]);

  const fetchEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, location, event_type, discipline, image_url')
        .eq('is_published', true)
        .gte('event_date', today)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (eventTypeFilter !== "all") {
      filtered = filtered.filter(e => e.event_type === eventTypeFilter);
    }

    if (disciplineFilter !== "all") {
      filtered = filtered.filter(e => e.discipline === disciplineFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(e => e.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (startDate) {
      filtered = filtered.filter(e => e.event_date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(e => e.event_date <= endDate);
    }

    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-primary-foreground">Carreras</h1>
      </div>
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <FilterBar
          onEventTypeChange={setEventTypeFilter}
          onDisciplineChange={setDisciplineFilter}
          onLocationChange={setLocationFilter}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
        
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando carreras...</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEvents.map((event) => (
                <Link key={event.id} to={`/race/${event.id}`}>
                  <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 right-3" variant="default">
                        {event.discipline}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-secondary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron carreras con estos filtros</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Races;
