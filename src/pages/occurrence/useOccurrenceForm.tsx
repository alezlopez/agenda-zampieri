
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Student } from "@/types";
import { toast } from "sonner";
import { sendOccurrenceData } from "./api";

// Define the validation schema
const occurrenceSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  nome_aluno: z.string().min(1, "Nome do aluno é obrigatório"),
  tipo_ocorrencia: z.string().min(1, "Selecione um tipo de ocorrência"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

export const useOccurrenceForm = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const userName = user?.user_metadata?.name || user?.email;

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      disciplina: "",
      nome_aluno: "",
      tipo_ocorrencia: "",
      descricao: "",
    },
  });

  const handleSelectStudent = (selectedStudent: Student) => {
    setStudent(selectedStudent);
    form.setValue("nome_aluno", selectedStudent.nome);
  };

  const onSubmit = async (values: OccurrenceFormValues) => {
    if (!student) {
      toast.error("Aluno não encontrado", {
        description: "Por favor, busque um aluno válido antes de enviar."
      });
      return;
    }
    
    setIsLoading(true);
    setSubmitError(null);
    
    try {
      const payload = {
        ...values,
        professor: userName,
        aluno: student.nome,
        curso: student.curso, 
        timestamp: new Date().toISOString(),
      };
      
      console.log("Sending payload:", payload);
      
      await sendOccurrenceData(payload);
      
      toast.success("Ocorrência registrada", {
        description: "A ocorrência foi registrada com sucesso."
      });
      
      setStudent(null);
      form.reset();
      setRetryCount(0);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setSubmitError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
      setRetryCount(prevCount => prevCount + 1);
      
      toast.error("Erro ao enviar", {
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    form.handleSubmit(onSubmit)();
  };

  return {
    form,
    student,
    isLoading,
    submitError,
    retryCount,
    MAX_RETRIES,
    userName,
    handleSelectStudent,
    onSubmit,
    handleRetry
  };
};
