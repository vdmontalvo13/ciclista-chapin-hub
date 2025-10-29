import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Calendar, MapPin, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface EventDetail {
  id: string;
  title: string;
  event_date: string;
  location: string;
  photos_link: string | null;
}

interface Result {
  id: string;
  position: number | null;
  time: string | null;
  notes: string | null;
  event_categories: {
    name: string;
    distance: number | null;
    elevation: number | null;
  } | null;
}

interface TopResult {
  position: number | null;
  time: string | null;
  cyclist_name: string;
  category_name: string;
}

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [myResult, setMyResult] = useState<Result | null>(null);
  const [topResults, setTopResults] = useState<TopResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResultDetails();
    }
  }, [id]);

  const fetchResultDetails = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, event_date, location, photos_link')
        .eq('id', id!)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch user's result
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .select(`
            id,
            position,
            time,
            notes,
            event_categories (
              name,
              distance,
              elevation
            )
          `)
          .eq('event_id', id!)
          .eq('cyclist_id', user.id)
          .maybeSingle();

        if (resultError && resultError.code !== 'PGRST116') throw resultError;
        setMyResult(resultData);
      }

      // Fetch top 10 results
      const { data: topData, error: topError } = await supabase
        .from('results')
        .select(`
          position,
          time,
          profiles!results_cyclist_id_fkey (full_name),
          event_categories (name)
        `)
        .eq('event_id', id!)
        .not('position', 'is', null)
        .order('position', { ascending: true })
        .limit(10);

      if (topError) throw topError;

      const formattedResults: TopResult[] = (topData || []).map((r: any) => ({
        position: r.position,
        time: r.time,
        cyclist_name: r.profiles?.full_name || 'Anónimo',
        category_name: r.event_categories?.name || 'N/A',
      }));

      setTopResults(formattedResults);
    } catch (error) {
      console.error('Error fetching result details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Evento no encontrado</p>
          <Button onClick={() => navigate('/mis-carreras')}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
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
          <h1 className="text-xl font-bold text-primary-foreground">Detalle de Resultados</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Race Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-secondary" />
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            </div>

            {myResult && (
              <>
                <Separator />
                <div className="bg-gradient-card p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Tu Resultado</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-secondary">
                        {myResult.position ? `Posición #${myResult.position}` : 'Participaste'}
                      </p>
                      {myResult.event_categories && (
                        <Badge variant="outline">{myResult.event_categories.name}</Badge>
                      )}
                    </div>
                    {myResult.time && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tiempo</p>
                        <p className="text-2xl font-bold font-mono">{myResult.time}</p>
                      </div>
                    )}
                  </div>
                  {myResult.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{myResult.notes}</p>
                  )}
                  {myResult.event_categories && (
                    <div className="flex gap-4 mt-2 text-sm">
                      {myResult.event_categories.distance && (
                        <span>Distancia: {myResult.event_categories.distance}km</span>
                      )}
                      {myResult.event_categories.elevation && (
                        <span>Desnivel: {myResult.event_categories.elevation}m</span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Results */}
        {topResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados Generales (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.position === 1 ? "bg-secondary/10" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg w-8">#{result.position}</span>
                      <div>
                        <p className="font-semibold">{result.cyclist_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {result.category_name}
                        </Badge>
                      </div>
                    </div>
                    {result.time && (
                      <p className="font-mono font-bold">{result.time}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos Link */}
        {event.photos_link && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Fotos del Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={event.photos_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" variant="outline">
                  Ver Galería de Fotos
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {!myResult && topResults.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Los resultados de esta carrera aún no están disponibles
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResultDetail;
