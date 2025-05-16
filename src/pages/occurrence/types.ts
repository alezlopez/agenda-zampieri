
import { Student } from "@/types";

export interface OccurrenceFormProps {
  onSubmitSuccess?: () => void;
}

export interface StudentSearchProps {
  onStudentSelect: (student: Student) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
