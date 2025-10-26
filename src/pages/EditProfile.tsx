import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "Carlos Méndez",
    email: "carlos@example.com",
    description: "Ciclista apasionado por el MTB y las rutas de montaña",
    city: "Guatemala",
    cyclingType: "MTB",
    gender: "Masculino",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil actualizado exitosamente");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-gradient-hero p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Editar Perfil</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                CM
              </div>
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                variant="secondary"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cyclingType">Tipo de ciclismo preferido</Label>
              <Select
                value={formData.cyclingType}
                onValueChange={(value) => setFormData({ ...formData, cyclingType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTB">MTB</SelectItem>
                  <SelectItem value="Ruta">Ruta</SelectItem>
                  <SelectItem value="Gravel">Gravel</SelectItem>
                  <SelectItem value="Urbano">Urbano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Guardar Cambios
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
