
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Discipline, Student, OccurrenceTypes } from "@/types";
import { toast } from "sonner";
import { getDisciplines, getStudents } from "@/services/supabase";
import { Search, Loader2, CheckCircle2, RefreshCcw } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const occurrenceSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  nome_aluno: z.string().min(1, "Nome do aluno é obrigatório"),
  tipo_ocorrencia: z.string().min(1, "Selecione um tipo de ocorrência"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

// URL correta do webhook para o envio de ocorrências
const WEBHOOK_URL = "https://n8n.colegiozampieri.com/webhook/agendadigital2";

const OccurrenceForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  useEffect(() => {
    const loadDisciplines = async () => {
      const disciplinesData = await getDisciplines();
      setDisciplines(disciplinesData);
    };

    loadDisciplines();
  }, []);

  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      setDropdownOpen(true);
      
      try {
        const allStudents = await getStudents();
        console.log("All students fetched:", allStudents);
        
        // Filter students based on the search query
        const filteredStudents = allStudents
          .filter(s => s.nome.toLowerCase().includes(searchQuery.toLowerCase()))
          .sort((a, b) => {
            // Sort by relevance - if name starts with search query, it should come first
            const aStartsWithQuery = a.nome.toLowerCase().startsWith(searchQuery.toLowerCase());
            const bStartsWithQuery = b.nome.toLowerCase().startsWith(searchQuery.toLowerCase());
            
            if (aStartsWithQuery && !bStartsWithQuery) return -1;
            if (!aStartsWithQuery && bStartsWithQuery) return 1;
            
            // Then sort alphabetically
            return a.nome.localeCompare(b.nome);
          })
          .slice(0, 10); // Limit to 10 results
        
        console.log("Filtered students:", filteredStudents);
        setSearchResults(filteredStudents);
      } catch (error) {
        console.error("Error searching students:", error);
        toast.error("Erro ao buscar alunos", {
          description: "Ocorreu um erro ao buscar os alunos. Tente novamente."
        });
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectStudent = (selectedStudent: Student) => {
    console.log("Selected student:", selectedStudent);
    setStudent(selectedStudent);
    form.setValue("nome_aluno", selectedStudent.nome);
    setSearchQuery("");
    setDropdownOpen(false);
  };

  // Função para enviar dados para o webhook com timeout e controle de erros
  const sendOccurrenceData = async (payload: any, attemptNumber: number = 1): Promise<boolean> => {
    try {
      console.log(`Attempt ${attemptNumber} for occurrence submission`);
      
      // Configurando um timeout de 15 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro de servidor: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      
      if (attemptNumber < MAX_RETRIES) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Retry attempt ${attemptNumber + 1} for occurrence submission`);
        return sendOccurrenceData(payload, attemptNumber + 1);
      }
      
      throw error;
    }
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-cz-red text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/06050319-92b3-4b72-906a-d53aad7fb3b2.png"
              alt="Logo"
              className="h-10 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-bold">Ocorrência Individual</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate("/dashboard")}>
              Voltar
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-cz-red">Registrar Ocorrência Individual</h2>
          
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="flex items-center justify-between">
                <span>{submitError}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
              
              <div className="form-field">
                <FormLabel>Professor</FormLabel>
                <Input 
                  value={userName}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="nome_aluno"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel>Nome do Aluno</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <div className="relative">
                            <div className="flex items-center absolute inset-y-0 left-0 pl-3 pointer-events-none">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input 
                              placeholder="Digite o nome do aluno" 
                              className="pl-9"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              onFocus={() => {
                                if (searchQuery.length >= 2) {
                                  setDropdownOpen(true);
                                }
                              }}
                              onBlur={() => {
                                // Delay hiding the dropdown to allow for clicking on items
                                setTimeout(() => setDropdownOpen(false), 200);
                              }}
                            />
                          </div>
                        </FormControl>
                      </div>
                      
                      {dropdownOpen && searchQuery.length >= 2 && (
                        <div className="relative mt-1 z-50">
                          <Command className="rounded-lg border shadow-md">
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              {isSearching ? (
                                <div className="p-2">
                                  <Skeleton className="h-8 w-full mb-2" />
                                  <Skeleton className="h-8 w-full mb-2" />
                                  <Skeleton className="h-8 w-full" />
                                </div>
                              ) : (
                                <>
                                  {searchResults.length === 0 ? (
                                    <CommandEmpty className="py-6 text-center text-sm">
                                      Nenhum aluno encontrado.
                                    </CommandEmpty>
                                  ) : (
                                    <CommandGroup heading="Alunos">
                                      {searchResults.map((s) => (
                                        <CommandItem
                                          key={s.id}
                                          value={s.nome}
                                          onSelect={() => handleSelectStudent(s)}
                                          className="flex items-center justify-between cursor-pointer hover:bg-muted p-2"
                                        >
                                          <div>
                                            <span className="font-medium">{s.nome}</span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                              {s.curso || "Série não disponível"}
                                            </span>
                                          </div>
                                          {student && student.id === s.id && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          )}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  )}
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {student && (
                  <Card className="p-4 bg-muted/50 border-cz-green">
                    <h3 className="font-medium text-cz-green">Aluno Selecionado:</h3>
                    <div className="mt-2">
                      <p><strong>Nome:</strong> {student.nome}</p>
                      <p><strong>Curso:</strong> {student.curso || "Não disponível"}</p>
                    </div>
                  </Card>
                )}
              </div>
              
              <FormField
                control={form.control}
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
              
              <FormField
                control={form.control}
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
                  disabled={isLoading || !student}
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
