-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'organizer', 'cyclist');

-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('travesia', 'carrera', 'colazo', 'travesia_y_carrera');

-- Create enum for disciplines
CREATE TYPE public.discipline AS ENUM ('mtb', 'ruta', 'gravel', 'urbano');

-- Create enum for registration status
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for organizer approval status
CREATE TYPE public.organizer_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  city TEXT,
  preferred_cycling_type TEXT,
  gender TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  status organizer_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  event_type event_type NOT NULL,
  discipline discipline NOT NULL,
  image_url TEXT,
  registration_link TEXT,
  photos_link TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_categories table (dynamic categories per event)
CREATE TABLE public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  distance DECIMAL(10,2),
  elevation DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  cyclist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.event_categories(id),
  status registration_status DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(event_id, cyclist_id)
);

-- Create results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  cyclist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.event_categories(id),
  position INTEGER,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, cyclist_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (role = 'cyclist' OR status = 'approved')
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (role = 'cyclist' OR status = 'approved')
$$;

-- Profiles RLS Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Roles RLS Policies
CREATE POLICY "User roles are viewable by the user and super admins"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can request cyclist role"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND role = 'cyclist'
  );

CREATE POLICY "Users can request organizer role"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND role = 'organizer'
  );

CREATE POLICY "Super admins can approve roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Events RLS Policies
CREATE POLICY "Published events are viewable by everyone"
  ON public.events FOR SELECT
  USING (is_published = true OR organizer_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id AND
    (public.has_role(auth.uid(), 'organizer') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  USING (
    organizer_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Organizers can delete their own events"
  ON public.events FOR DELETE
  USING (
    organizer_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Event Categories RLS Policies
CREATE POLICY "Categories are viewable with their event"
  ON public.event_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_categories.event_id
        AND (events.is_published = true OR events.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

CREATE POLICY "Organizers can manage categories for their events"
  ON public.event_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_categories.event_id
        AND (events.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Registrations RLS Policies
CREATE POLICY "Users can view their own registrations"
  ON public.registrations FOR SELECT
  USING (
    cyclist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id
        AND events.organizer_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Cyclists can register for events"
  ON public.registrations FOR INSERT
  WITH CHECK (
    auth.uid() = cyclist_id AND
    public.has_role(auth.uid(), 'cyclist')
  );

CREATE POLICY "Organizers can update registrations for their events"
  ON public.registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id
        AND (events.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Results RLS Policies
CREATE POLICY "Results are viewable by everyone"
  ON public.results FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage results for their events"
  ON public.results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = results.event_id
        AND (events.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, photo_url, city, preferred_cycling_type, gender, description)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'photo_url',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'preferred_cycling_type',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'description'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();