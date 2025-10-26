import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const RaceDetail = () => {
  const { id } = useParams();

  // Mock data - will be replaced with actual data
  const race = {
    id: id,
    title: "Gran Fondo Antigua",
    date: "15 de Noviembre, 2025",
    location: "Antigua Guatemala",
    type: "Ruta",
    category: "Elite",
    participants: 250,
    elevation: "1,200m",
    distance: "85km",
    price: "Q250",
    description: "Una carrera épica a través de las montañas volcánicas de Guatemala. Rutas desafiantes con vistas impresionantes del paisaje guatemalteco.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop",
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="relative h-64 overflow-hidden">
        <img
          src={race.imageUrl}
          alt={race.title}
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
          <Badge
            className="mb-2"
            variant={race.type === "MTB" ? "default" : "secondary"}
          >
            {race.type}
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">{race.title}</h1>
          <p className="text-white/90 text-sm">{race.category}</p>
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
                  <p className="font-medium">{race.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{race.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Participantes</p>
                  <p className="font-medium">{race.participants}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Desnivel</p>
                  <p className="font-medium">{race.elevation}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Inscripción</p>
                  <p className="font-medium">{race.price}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              {race.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3">Categorías</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Juvenil</span>
                <span className="text-sm text-muted-foreground">15-20 años</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Master A</span>
                <span className="text-sm text-muted-foreground">21-30 años</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Master B</span>
                <span className="text-sm text-muted-foreground">31-40 años</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Master C</span>
                <span className="text-sm text-muted-foreground">41-50 años</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Master D</span>
                <span className="text-sm text-muted-foreground">51 en adelante</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg">
          Inscribirse Ahora
        </Button>
      </div>
      
      <Navigation />
    </div>
  );
};

export default RaceDetail;
