import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  onEventTypeChange: (type: string) => void;
  onDisciplineChange: (discipline: string) => void;
  onLocationChange: (location: string) => void;
  onDateChange: (date: string) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

const FilterBar = ({ onEventTypeChange, onDisciplineChange, onLocationChange, onDateChange }: FilterBarProps) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <Filter className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex flex-1 gap-2">
          <Input 
            type="date"
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1"
            placeholder="Fecha inicio"
          />
          <Input 
            type="date"
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1"
            placeholder="Fecha fin"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select onValueChange={onEventTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Travesía">Travesía</SelectItem>
            <SelectItem value="Carrera">Carrera</SelectItem>
            <SelectItem value="Colazo">Colazo</SelectItem>
            <SelectItem value="Travesía y Carrera">Travesía y Carrera</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={onDisciplineChange}>
          <SelectTrigger>
            <SelectValue placeholder="Disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="MTB">MTB</SelectItem>
            <SelectItem value="Ruta">Ruta</SelectItem>
            <SelectItem value="Gravel">Gravel</SelectItem>
            <SelectItem value="Urbano">Urbano</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={onLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Guatemala">Guatemala</SelectItem>
            <SelectItem value="Antigua">Antigua</SelectItem>
            <SelectItem value="Panajachel">Panajachel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
