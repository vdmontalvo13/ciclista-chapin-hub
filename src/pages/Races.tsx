import { useState } from "react";
import Navigation from "@/components/Navigation";
import RaceCard, { Race } from "@/components/RaceCard";
import FilterBar from "@/components/FilterBar";

const mockRaces: Race[] = [
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
  {
    id: "3",
    title: "Vuelta al Lago Atitlán",
    date: "29 de Noviembre, 2025",
    location: "Panajachel",
    type: "Ruta",
    category: "Amateur",
    participants: 320,
    elevation: "900m",
    distance: "120km",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Desafío Sierra Madre",
    date: "6 de Diciembre, 2025",
    location: "Huehuetenango",
    type: "MTB",
    category: "Expert",
    participants: 150,
    elevation: "2,100m",
    distance: "60km",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop",
  },
];

const Races = () => {
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const filteredRaces = mockRaces.filter((race) => {
    const matchesEventType = eventTypeFilter === "all" || race.category === eventTypeFilter;
    const matchesDiscipline = disciplineFilter === "all" || race.type === disciplineFilter;
    const matchesLocation = locationFilter === "all" || race.location.includes(locationFilter);
    const matchesDate = !dateFilter || race.date.includes(dateFilter);
    return matchesEventType && matchesDiscipline && matchesLocation && matchesDate;
  });

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
          onDateChange={setDateFilter}
        />
        
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRaces.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
        
        {filteredRaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron carreras con estos filtros</p>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Races;
