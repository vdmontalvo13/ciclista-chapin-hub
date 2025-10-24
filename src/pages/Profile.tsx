import { User, Settings, Trophy, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="bg-gradient-hero p-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary-foreground">Perfil</h1>
          <Button variant="ghost" size="icon" className="text-primary-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center -mb-16">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=rider" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-xl font-bold text-primary-foreground">Juan Ciclista</h2>
          <p className="text-primary-foreground/80">Ciclista Amateur</p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pt-20 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Carreras</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">45</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Próximas Carreras</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Gran Fondo Antigua</p>
                  <p className="text-sm text-muted-foreground">15 Nov 2025</p>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">MTB Volcán de Agua</p>
                  <p className="text-sm text-muted-foreground">22 Nov 2025</p>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full">
          Editar Perfil
        </Button>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;
