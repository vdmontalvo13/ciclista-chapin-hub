import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
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

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    price: "",
    eventType: "",
    discipline: "",
    distance: "",
    elevation: "",
    description: "",
    categories: [
      { name: "Juvenil", ageRange: "15-20 años" },
      { name: "Master A", ageRange: "21-30 años" },
      { name: "Master B", ageRange: "31-40 años" },
      { name: "Master C", ageRange: "41-50 años" },
      { name: "Master D", ageRange: "51 en adelante" },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Evento creado exitosamente");
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
          <h1 className="text-2xl font-bold text-primary-foreground">Crear Evento</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del evento</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Gran Fondo Antigua"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Antigua Guatemala"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de evento</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travesía">Travesía</SelectItem>
                  <SelectItem value="Carrera">Carrera</SelectItem>
                  <SelectItem value="Colazo">Colazo</SelectItem>
                  <SelectItem value="Travesía y Carrera">Travesía y Carrera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) => setFormData({ ...formData, discipline: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTB">MTB</SelectItem>
                  <SelectItem value="Ruta">Ruta</SelectItem>
                  <SelectItem value="Gravel">Gravel</SelectItem>
                  <SelectItem value="Urbano">Urbano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distancia</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="Ej: 85km"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="elevation">Elevación</Label>
                <Input
                  id="elevation"
                  value={formData.elevation}
                  onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                  placeholder="Ej: 1,200m"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio de inscripción</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ej: 150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe el evento..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categorías</Label>
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                {formData.categories.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-sm text-muted-foreground">{cat.ageRange}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen del evento</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir una imagen o arrastra aquí
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Crear Evento
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
