
import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface DescriptionFieldProps {
  control: Control<any>;
}

const DescriptionField = ({ control }: DescriptionFieldProps) => {
  return (
    <FormField
      control={control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição da Ocorrência</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Detalhe a ocorrência..." 
              className="min-h-[120px]"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
