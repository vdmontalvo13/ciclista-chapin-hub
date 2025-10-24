import { Calendar, MapPin, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface Race {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "MTB" | "Ruta";
  category: string;
  participants: number;
  elevation: string;
  distance: string;
  imageUrl: string;
}

interface RaceCardProps {
  race: Race;
}

const RaceCard = ({ race }: RaceCardProps) => {
  return (
    <Link to={`/race/${race.id}`}>
      <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 cursor-pointer group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={race.imageUrl}
            alt={race.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge
            className="absolute top-3 right-3"
            variant={race.type === "MTB" ? "default" : "secondary"}
          >
            {race.type}
          </Badge>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {race.title}
          </h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{race.date}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <span>{race.location}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-accent" />
                <span>{race.participants}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>{race.elevation}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {race.category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RaceCard;
