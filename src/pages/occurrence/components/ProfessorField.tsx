
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";

interface ProfessorFieldProps {
  userName: string;
}

const ProfessorField = ({ userName }: ProfessorFieldProps) => {
  return (
    <div className="form-field">
      <FormLabel>Professor</FormLabel>
      <Input 
        value={userName}
        disabled
        className="bg-muted"
      />
    </div>
  );
};

export default ProfessorField;
