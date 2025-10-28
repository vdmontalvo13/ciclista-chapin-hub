import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Races from "./pages/Races";
import RaceDetail from "./pages/RaceDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreateEvent from "./pages/CreateEvent";
import MisCarreras from "./pages/MisCarreras";
import ResultDetail from "./pages/ResultDetail";
import Auth from "./pages/Auth";
import ApproveOrganizers from "./pages/ApproveOrganizers";
import ManageRegistrations from "./pages/ManageRegistrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/races" element={<Races />} />
          <Route path="/race/:id" element={<RaceDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/mis-carreras" element={<MisCarreras />} />
          <Route path="/result/:id" element={<ResultDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/approve-organizers" element={<ApproveOrganizers />} />
          <Route path="/manage-registrations/:eventId" element={<ManageRegistrations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
