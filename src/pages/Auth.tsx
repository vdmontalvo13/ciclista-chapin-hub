import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<'cyclist' | 'organizer'>('cyclist');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    cyclingType: '',
    gender: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: "Error de autenticación",
          description: error.message === "Invalid login credentials" 
            ? "Credenciales incorrectas"
            : error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de nuevo!",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user with metadata
      const { data, error } = await signUp(
        registerData.email,
        registerData.password,
        {
          full_name: registerData.fullName,
          photo_url: photoPreview,
          city: registerData.city,
          preferred_cycling_type: registerData.cyclingType,
          gender: registerData.gender,
          description: registerData.description,
        }
      );

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message === "User already registered"
            ? "Este correo ya está registrado"
            : error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Create user role record
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: userRole,
            status: userRole === 'cyclist' ? 'approved' : 'pending'
          });

        if (roleError) {
          console.error('Error creating role:', roleError);
        }

        toast({
          title: "Cuenta creada",
          description: userRole === 'organizer' 
            ? "Tu solicitud como organizador está pendiente de aprobación"
            : "Bienvenido a El Ciclista Chapín!",
        });

        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(188 95% 42%), hsl(142 76% 36%))' }}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <img src={logo} alt="El Ciclista Chapín" className="w-32 h-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">El Ciclista Chapín</CardTitle>
          <CardDescription className="text-center">
            Únete a la comunidad de ciclistas guatemaltecos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo Electrónico</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photoPreview} />
                      <AvatarFallback>
                        <Upload className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Usuario</Label>
                  <RadioGroup value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cyclist" id="cyclist" />
                      <Label htmlFor="cyclist">Ciclista</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="organizer" id="organizer" />
                      <Label htmlFor="organizer">Organizador</Label>
                    </div>
                  </RadioGroup>
                  {userRole === 'organizer' && (
                    <p className="text-xs text-muted-foreground">
                      Tu solicitud como organizador requerirá aprobación del administrador
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Select 
                    value={registerData.city}
                    onValueChange={(value) => setRegisterData({ ...registerData, city: value })}
                    required
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guatemala">Ciudad de Guatemala</SelectItem>
                      <SelectItem value="antigua">Antigua Guatemala</SelectItem>
                      <SelectItem value="quetzaltenango">Quetzaltenango</SelectItem>
                      <SelectItem value="escuintla">Escuintla</SelectItem>
                      <SelectItem value="coban">Cobán</SelectItem>
                      <SelectItem value="huehuetenango">Huehuetenango</SelectItem>
                      <SelectItem value="peten">Petén</SelectItem>
                      <SelectItem value="otro">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cycling-type">Tipo de Ciclismo Preferido</Label>
                  <Select 
                    value={registerData.cyclingType}
                    onValueChange={(value) => setRegisterData({ ...registerData, cyclingType: value })}
                    required
                  >
                    <SelectTrigger id="cycling-type">
                      <SelectValue placeholder="Selecciona tipo de ciclismo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ruta">Ruta</SelectItem>
                      <SelectItem value="montaña">Montaña (MTB)</SelectItem>
                      <SelectItem value="gravel">Gravel</SelectItem>
                      <SelectItem value="bmx">BMX</SelectItem>
                      <SelectItem value="urbano">Urbano</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select 
                    value={registerData.gender}
                    onValueChange={(value) => setRegisterData({ ...registerData, gender: value })}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Cuéntanos sobre ti y tu pasión por el ciclismo..."
                    rows={3}
                    value={registerData.description}
                    onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
