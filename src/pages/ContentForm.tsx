
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
import { Discipline, Class } from "@/types";
import { toast } from "sonner";
import { getDisciplines, getClasses } from "@/services/supabase";

const contentSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  turma: z.string().min(1, "Selecione uma turma"),
  tarefa: z.string().min(3, "O título da tarefa é obrigatório"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

type ContentFormValues = z.infer<typeof contentSchema>;

const ContentForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      disciplina: "",
      turma: "",
      tarefa: "",
      descricao: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const disciplinesData = await getDisciplines();
      setDisciplines(disciplinesData);
      
      const classesData = await getClasses();
      setClasses(classesData);
    };

    loadData();
  }, []);

  const onSubmit = async (values: ContentFormValues) => {
    setIsLoading(true);
    
    try {
      const webhookUrl = "https://n8n.colegiozampieri.com/webhook/agendadigital";
      
      const payload = {
        ...values,
        professor: user?.user_metadata?.name || user?.email,
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
      
      toast("Conteúdo registrado", {
        description: "O conteúdo foi registrado com sucesso."
      });
      
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

  const userName = user?.user_metadata?.name || user?.email;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-cz-green text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/06050319-92b3-4b72-906a-d53aad7fb3b2.png"
              alt="Logo"
              className="h-10 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-bold">Lançamento de Conteúdo</h1>
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
          <h2 className="text-2xl font-bold mb-6 text-cz-green">Registrar Conteúdo ou Tarefa</h2>
          
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
              
              <FormField
                control={form.control}
                name="turma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.nome}>
                            {cls.nome}
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
                name="tarefa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarefa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lição de casa - Capítulo 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhe o que deve ser feito nesta tarefa..." 
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
                  className="bg-cz-green hover:bg-cz-green/90 text-white"
                  disabled={isLoading}
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

export default ContentForm;
