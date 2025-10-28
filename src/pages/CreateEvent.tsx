import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Trash2, Edit } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id?: string;
  name: string;
  ageRange: string;
  price: number;
  distance: number;
  elevation: number;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    eventType: "",
    discipline: "",
    description: "",
    registrationLink: "",
  });

  const [categories, setCategories] = useState<Category[]>([
    { name: "Juvenil", ageRange: "15-20 años", price: 100, distance: 40, elevation: 500 },
    { name: "Master A", ageRange: "21-30 años", price: 150, distance: 60, elevation: 800 },
    { name: "Master B", ageRange: "31-40 años", price: 150, distance: 60, elevation: 800 },
    { name: "Master C", ageRange: "41-50 años", price: 150, distance: 50, elevation: 600 },
    { name: "Master D", ageRange: "51 en adelante", price: 150, distance: 40, elevation: 500 },
  ]);

  const [categoryForm, setCategoryForm] = useState<Category>({
    name: "",
    ageRange: "",
    price: 0,
    distance: 0,
    elevation: 0,
  });

  const handleOpenCategoryDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingCategoryIndex(index);
      setCategoryForm(categories[index]);
    } else {
      setEditingCategoryIndex(null);
      setCategoryForm({
        name: "",
        ageRange: "",
        price: 0,
        distance: 0,
        elevation: 0,
      });
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name || !categoryForm.ageRange) {
      toast({
        title: "Error",
        description: "Debes completar el nombre y rango de edad",
        variant: "destructive",
      });
      return;
    }

    if (editingCategoryIndex !== null) {
      const newCategories = [...categories];
      newCategories[editingCategoryIndex] = categoryForm;
      setCategories(newCategories);
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
    } else {
      setCategories([...categories, categoryForm]);
      toast({
        title: "Categoría agregada",
        description: "La categoría ha sido agregada exitosamente",
      });
    }

    setShowCategoryDialog(false);
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    toast({
      title: "Categoría eliminada",
      description: "La categoría ha sido eliminada",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un evento",
        variant: "destructive",
      });
      return;
    }

    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una categoría",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: formData.title,
          description: formData.description,
          event_date: formData.date,
          event_time: formData.time,
          location: formData.location,
          event_type: formData.eventType.toLowerCase().replace(' ', '_') as any,
          discipline: formData.discipline.toLowerCase() as any,
          registration_link: formData.registrationLink,
          is_published: true,
        } as any)
        .select()
        .single();

      if (eventError) throw eventError;

      // Create categories
      const categoryInserts = categories.map(cat => ({
        event_id: event.id,
        name: cat.name,
        age_range: cat.ageRange,
        price: cat.price,
        distance: cat.distance,
        elevation: cat.elevation,
      }));

      const { error: categoriesError } = await supabase
        .from('event_categories')
        .insert(categoryInserts);

      if (categoriesError) throw categoriesError;

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente",
      });

      navigate("/profile");
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travesia">Travesía</SelectItem>
                  <SelectItem value="carrera">Carrera</SelectItem>
                  <SelectItem value="colazo">Colazo</SelectItem>
                  <SelectItem value="travesia_y_carrera">Travesía y Carrera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtb">MTB</SelectItem>
                  <SelectItem value="ruta">Ruta</SelectItem>
                  <SelectItem value="gravel">Gravel</SelectItem>
                  <SelectItem value="urbano">Urbano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationLink">Link de Inscripción</Label>
              <Input
                id="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                placeholder="https://..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Este link se mostrará cuando los ciclistas presionen "Inscribirse Ahora"
              </p>
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
              <div className="flex items-center justify-between">
                <Label>Categorías</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCategoryDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
              
              {categories.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No hay categorías. Agrega al menos una.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold">{cat.name}</h4>
                            <p className="text-sm text-muted-foreground">{cat.ageRange}</p>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Precio:</span>
                                <p className="font-medium">Q{cat.price}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Distancia:</span>
                                <p className="font-medium">{cat.distance}km</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Elevación:</span>
                                <p className="font-medium">{cat.elevation}m</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenCategoryDialog(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Imagen del evento</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir una imagen o arrastra aquí
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Funcionalidad próximamente)
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Evento'}
          </Button>
        </form>
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryIndex !== null ? 'Editar' : 'Agregar'} Categoría
            </DialogTitle>
            <DialogDescription>
              Define los detalles de la categoría
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ej: Master A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-age">Rango de Edad</Label>
              <Input
                id="cat-age"
                value={categoryForm.ageRange}
                onChange={(e) => setCategoryForm({ ...categoryForm, ageRange: e.target.value })}
                placeholder="Ej: 21-30 años"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-price">Precio (Q)</Label>
              <Input
                id="cat-price"
                type="number"
                value={categoryForm.price}
                onChange={(e) => setCategoryForm({ ...categoryForm, price: parseFloat(e.target.value) })}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-distance">Distancia (km)</Label>
              <Input
                id="cat-distance"
                type="number"
                value={categoryForm.distance}
                onChange={(e) => setCategoryForm({ ...categoryForm, distance: parseFloat(e.target.value) })}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-elevation">Elevación (m)</Label>
              <Input
                id="cat-elevation"
                type="number"
                value={categoryForm.elevation}
                onChange={(e) => setCategoryForm({ ...categoryForm, elevation: parseFloat(e.target.value) })}
                placeholder="800"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategoryIndex !== null ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEvent;
