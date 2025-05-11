
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
import { getDisciplines, findStudentByName } from "@/services/supabase";

const occurrenceSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  nome_aluno: z.string().min(1, "Nome do aluno é obrigatório"),
  tipo_ocorrencia: z.string().min(1, "Selecione um tipo de ocorrência"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

const OccurrenceForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFindStudent = async (name: string) => {
    if (!name) return;
    
    setSearchingStudent(true);
    const foundStudent = await findStudentByName(name);
    setSearchingStudent(false);
    
    if (foundStudent) {
      setStudent(foundStudent);
    } else {
      setStudent(null);
      toast.error("Aluno não encontrado", {
        description: "Nenhum aluno encontrado com este nome."
      });
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
    
    try {
      const webhookUrl = "https://n8n.colegiozampieri.com/webhook/agendadigital1";
      
      const payload = {
        ...values,
        professor: userName,
        aluno: student.nome,
        turma: student.turma_id,
        timestamp: new Date().toISOString(),
      };
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao enviar o formulário");
      }
      
      toast("Ocorrência registrada", {
        description: "A ocorrência foi registrada com sucesso."
      });
      
      setStudent(null);
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar", {
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
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
                      <SelectContent>
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
                    <FormItem>
                      <FormLabel>Nome do Aluno</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="Digite o nome do aluno" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          onClick={() => handleFindStudent(field.value)}
                          disabled={searchingStudent || !field.value}
                          className="bg-cz-green hover:bg-cz-green/90"
                        >
                          {searchingStudent ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {student && (
                  <Card className="p-4 bg-muted/50 border-cz-green">
                    <h3 className="font-medium text-cz-green">Aluno Encontrado:</h3>
                    <div className="mt-2">
                      <p><strong>Nome:</strong> {student.nome}</p>
                      <p><strong>Curso:</strong> {student.curso}</p>
                      <p><strong>Turma:</strong> {student.turma_id}</p>
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
                      <SelectContent>
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
                  className="bg-cz-red hover:bg-cz-red/90"
                  disabled={isLoading || !student}
                >
                  {isLoading ? "Enviando..." : "Enviar"}
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
