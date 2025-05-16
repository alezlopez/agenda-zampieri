
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student } from "@/types";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Header from "./components/Header";
import DisciplineField from "./components/DisciplineField";
import ProfessorField from "./components/ProfessorField";
import StudentSearchField from "./components/StudentSearchField";
import OccurrenceTypeField from "./components/OccurrenceTypeField";
import DescriptionField from "./components/DescriptionField";
import { occurrenceSchema } from "./schema";

type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

const OccurrenceForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  const handleStudentChange = (selectedStudent: Student | null, query: string) => {
    setStudent(selectedStudent);
    setSearchQuery(query);
    
    if (selectedStudent) {
      form.setValue("nome_aluno", selectedStudent.nome);
    } else if (query === "") {
      form.setValue("nome_aluno", "");
    }
  };

  const sendOccurrenceData = async (payload: any, maxRetries: number = 2): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    try {
      const response = await fetch("https://n8n.colegiozampieri.com/webhook/agendaOcorrencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we have retries left and it's a network error, retry
      if (maxRetries > 0 && error instanceof TypeError && error.message === "Failed to fetch") {
        console.log(`Retry attempt ${3 - maxRetries} for occurrence submission`);
        // Wait 1.5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 1500));
        return sendOccurrenceData(payload, maxRetries - 1);
      }
      
      throw error;
    }
  };

  const onSubmit = async (values: OccurrenceFormValues) => {
    // Validate that a student is selected
    if (!student || !student.id) {
      toast.error("Aluno não encontrado", {
        description: "Por favor, busque e selecione um aluno válido antes de enviar."
      });
      return;
    }
    
    setIsLoading(true);
    setNetworkError(false);
    
    try {
      // Creating the payload
      const payload = {
        disciplina: values.disciplina,
        professor: userName,
        aluno: student.nome,
        curso: student.curso,
        tipo_ocorrencia: values.tipo_ocorrencia,
        descricao: values.descricao,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Sending payload:", payload);
      
      // Using improved fetch with retries
      const response = await sendOccurrenceData(payload);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      // Success handling
      toast.success("Ocorrência registrada", {
        description: "A ocorrência foi registrada com sucesso."
      });
      
      // Reset form and student selection
      setStudent(null);
      setSearchQuery("");
      form.reset();
      
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      
      // Better error handling with specific messages
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setNetworkError(true);
        toast.error("Erro de conexão", {
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente."
        });
      } else if (error instanceof DOMException && error.name === "AbortError") {
        toast.error("Tempo limite excedido", {
          description: "A solicitação demorou muito para responder. Verifique sua conexão e tente novamente."
        });
      } else {
        toast.error("Erro ao enviar", {
          description: "Ocorreu um erro ao enviar o formulário. Tente novamente em alguns instantes."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setNetworkError(false);
    setRetryCount(prev => prev + 1);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header userName={userName} navigate={navigate} logout={logout} />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-cz-red">Registrar Ocorrência Individual</h2>
          
          {networkError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Problema de conexão detectado</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>Não foi possível conectar ao servidor. Isso pode ocorrer devido a:</p>
                  <ul className="list-disc ml-5">
                    <li>Problemas na sua conexão com a internet</li>
                    <li>O servidor pode estar temporariamente indisponível</li>
                    <li>Bloqueio de firewall ou proxy na rede</li>
                  </ul>
                  <div className="flex justify-end mt-3">
                    <Button 
                      variant="outline" 
                      onClick={handleRetry} 
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tentar Novamente
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <DisciplineField control={form.control} />
              
              <ProfessorField userName={userName} />
              
              <StudentSearchField
                control={form.control}
                student={student}
                searchQuery={searchQuery}
                onStudentChange={handleStudentChange}
              />
              
              <OccurrenceTypeField control={form.control} />
              
              <DescriptionField control={form.control} />

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-cz-red hover:bg-cz-red/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : "Enviar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default OccurrenceForm;
