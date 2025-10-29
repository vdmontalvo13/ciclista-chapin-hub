import { useState, useEffect } from "react";
import { User, Settings, Trophy, Calendar, Plus, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string;
  email: string;
  photo_url: string | null;
  city: string;
  preferred_cycling_type: string;
  description: string;
}

interface UpcomingRace {
  id: string;
  title: string;
  event_date: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isOrganizer, isSuperAdmin, loading: roleLoading } = useUserRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingRaces, setUpcomingRaces] = useState<UpcomingRace[]>([]);
  const [stats, setStats] = useState({ totalRaces: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
      fetchUpcomingRaces();
      fetchStats();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUpcomingRaces = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('registrations')
        .select('events(id, title, event_date)')
        .eq('cyclist_id', user!.id)
        .eq('status', 'approved')
        .gte('events.event_date', today)
        .order('events.event_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      const races = data?.map(r => r.events).filter(Boolean) as UpcomingRace[];
      setUpcomingRaces(races || []);
    } catch (error) {
      console.error('Error fetching upcoming races:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('event_id, events(event_date)')
        .eq('cyclist_id', user!.id)
        .eq('status', 'approved');

      if (error) throw error;

      const total = data?.length || 0;
      const now = new Date();
      const thisMonth = data?.filter(r => {
        const eventDate = new Date(r.events?.event_date || '');
        return eventDate.getMonth() === now.getMonth() && 
               eventDate.getFullYear() === now.getFullYear();
      }).length || 0;

      setStats({ totalRaces: total, thisMonth });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || roleLoading || loading || !profile) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="bg-gradient-hero p-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary-foreground">Perfil</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center -mb-16">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.photo_url || undefined} />
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-xl font-bold text-primary-foreground">{profile.full_name}</h2>
          <p className="text-primary-foreground/80">{profile.preferred_cycling_type || 'Ciclista'}</p>
          <div className="flex gap-2 mt-2">
            {isSuperAdmin && <Badge className="bg-yellow-500">Super Admin</Badge>}
            {isOrganizer && <Badge className="bg-blue-500">Organizador</Badge>}
            <Badge className="bg-green-500">Ciclista</Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pt-20 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalRaces}</p>
              <p className="text-xs text-muted-foreground">Carreras</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile.city || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Ciudad</p>
            </CardContent>
          </Card>
        </div>

        {profile.description && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Sobre mí</h3>
              <p className="text-muted-foreground">{profile.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Próximas Carreras</h3>
            {upcomingRaces.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No tienes carreras próximas</p>
            ) : (
              <div className="space-y-3">
                {upcomingRaces.map((race) => (
                  <Link key={race.id} to={`/race/${race.id}`}>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">{race.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(race.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Ver</Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => navigate("/edit-profile")}>
          Editar Perfil
        </Button>

        {isSuperAdmin && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/approve-organizers")}
          >
            Aprobar Organizadores
          </Button>
        )}

        {(isOrganizer || isSuperAdmin) && (
          <Button className="w-full" onClick={() => navigate("/create-event")}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Evento
          </Button>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;
