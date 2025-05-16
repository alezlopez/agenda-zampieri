
import { Student } from "@/types";
import { Card } from "@/components/ui/card";

interface SelectedStudentProps {
  student: Student | null;
}

const SelectedStudent = ({ student }: SelectedStudentProps) => {
  if (!student) return null;
  
  return (
    <Card className="p-4 bg-muted/50 border-cz-green">
      <h3 className="font-medium text-cz-green">Aluno Selecionado:</h3>
      <div className="mt-2">
        <p><strong>Nome:</strong> {student.nome}</p>
        <p><strong>Curso:</strong> {student.curso || "Não disponível"}</p>
      </div>
    </Card>
  );
};

export default SelectedStudent;
