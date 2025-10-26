import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Calendar, MapPin, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - en el futuro esto vendrá de la base de datos
  const raceDetail = {
    id: 1,
    race: "Gran Fondo Antigua",
    date: "15 Oct 2025",
    location: "Antigua Guatemala",
    category: "Elite",
    distance: "85km",
    elevation: "1,200m",
    myPosition: 1,
    myTime: "2:45:30",
    photoLink: "https://photos.example.com/gran-fondo-antigua-2025",
    participants: 250,
    weather: "Soleado, 22°C",
  };

  const topResults = [
    { position: 1, name: "Tu nombre", time: "2:45:30", category: "Elite" },
    { position: 2, name: "Juan Pérez", time: "2:47:15", category: "Elite" },
    { position: 3, name: "Carlos López", time: "2:49:45", category: "Elite" },
    { position: 4, name: "Miguel Sánchez", time: "2:51:20", category: "Elite" },
    { position: 5, name: "Pedro García", time: "2:53:10", category: "Elite" },
  ];

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
              {raceDetail.race}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{raceDetail.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{raceDetail.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{raceDetail.distance}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Desnivel: </span>
                <span className="font-semibold">{raceDetail.elevation}</span>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-card p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Tu Resultado</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-secondary">Posición #{raceDetail.myPosition}</p>
                  <Badge variant="outline">{raceDetail.category}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tiempo</p>
                  <p className="text-2xl font-bold font-mono">{raceDetail.myTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participantes</span>
              <span className="font-semibold">{raceDetail.participants}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clima</span>
              <span className="font-semibold">{raceDetail.weather}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topResults.map((result) => (
                <div
                  key={result.position}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.position === 1 ? "bg-secondary/10" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg w-8">#{result.position}</span>
                    <div>
                      <p className="font-semibold">{result.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="font-mono font-bold">{result.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photos Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Fotos del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={raceDetail.photoLink}
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
      </div>
    </div>
  );
};

export default ResultDetail;
