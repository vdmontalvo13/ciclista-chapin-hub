import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

const Results = () => {
  const results = [
    {
      id: 1,
      race: "Gran Fondo Antigua",
      date: "15 Oct 2025",
      position: 1,
      category: "Elite",
      time: "2:45:30",
    },
    {
      id: 2,
      race: "MTB Volcán de Agua",
      date: "8 Oct 2025",
      position: 2,
      category: "Open",
      time: "1:32:15",
    },
    {
      id: 3,
      race: "Vuelta al Lago",
      date: "1 Oct 2025",
      position: 3,
      category: "Amateur",
      time: "3:12:45",
    },
  ];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-secondary" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-accent" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-primary-foreground">Resultados</h1>
      </div>
      
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-hover transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getPositionIcon(result.position)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{result.race}</h3>
                  <p className="text-sm text-muted-foreground">{result.date}</p>
                </div>
                
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {result.category}
                  </Badge>
                  <p className="text-sm font-mono font-bold">{result.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {results.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aún no tienes resultados</p>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Results;
