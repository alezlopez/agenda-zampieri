
import { useEffect, useState } from "react";
import { Control } from "react-hook-form";
import { Discipline } from "@/types";
import { getDisciplines } from "@/services/supabase";
import { 
  FormField, 
  FormItem, 
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DisciplineFieldProps {
  control: Control<any>;
}

const DisciplineField = ({ control }: DisciplineFieldProps) => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  useEffect(() => {
    const loadDisciplines = async () => {
      const disciplinesData = await getDisciplines();
      setDisciplines(disciplinesData);
    };

    loadDisciplines();
  }, []);

  return (
    <FormField
      control={control}
      name="disciplina"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Disciplina</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="z-50 bg-white">
              {disciplines.map((discipline) => (
                <SelectItem key={discipline.id} value={discipline.nome}>
                  {discipline.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DisciplineField;
