
import { Control } from "react-hook-form";
import { OccurrenceTypes } from "@/types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OccurrenceTypeFieldProps {
  control: Control<any>;
}

const OccurrenceTypeField = ({ control }: OccurrenceTypeFieldProps) => {
  return (
    <FormField
      control={control}
      name="tipo_ocorrencia"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Ocorrência</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de ocorrência" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="z-50 bg-white">
              {OccurrenceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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

export default OccurrenceTypeField;
