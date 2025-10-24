import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onTypeChange: (type: string) => void;
  onLocationChange: (location: string) => void;
}

const FilterBar = ({ onTypeChange, onLocationChange }: FilterBarProps) => {
  return (
    <div className="flex gap-3 items-center p-4 bg-gradient-card rounded-xl border border-border">
      <Filter className="h-5 w-5 text-primary" />
      
      <Select onValueChange={onTypeChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Tipo de carrera" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="MTB">MTB</SelectItem>
          <SelectItem value="Ruta">Ruta</SelectItem>
        </SelectContent>
      </Select>
      
      <Select onValueChange={onLocationChange}>
        <SelectTrigger className="flex-1">
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
  );
};

export default FilterBar;
