import { ArrowRight, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import RaceCard, { Race } from "@/components/RaceCard";
import heroImage from "@/assets/hero-cycling.jpg";

const upcomingRaces: Race[] = [
  {
    id: "1",
    title: "Gran Fondo Antigua",
    date: "15 de Noviembre, 2025",
    location: "Antigua Guatemala",
    type: "Ruta",
    category: "Elite",
    participants: 250,
    elevation: "1,200m",
    distance: "85km",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "MTB Volcán de Agua",
    date: "22 de Noviembre, 2025",
    location: "Santa María de Jesús",
    type: "MTB",
    category: "Open",
    participants: 180,
    elevation: "1,800m",
    distance: "45km",
    imageUrl: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Cycling in Guatemala"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              El Ciclista Chapín
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-xl">
              Descubre y participa en las mejores carreras de ciclismo de Guatemala
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
      <div className="container max-w-6xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Carreras</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">2.5k</p>
              <p className="text-xs text-muted-foreground">Ciclistas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-accent/20">
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
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
          
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingRaces.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Index;
