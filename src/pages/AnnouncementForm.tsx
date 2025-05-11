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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Class } from "@/types";
import { toast } from "sonner";
import { getClasses } from "@/services/supabase";

const announcementSchema = z.object({
  destinatario: z.enum(["todas", "unica"]),
  turma: z.string().optional(),
  titulo: z.string().min(3, "O título é obrigatório"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
}).refine((data) => {
  if (data.destinatario === "unica" && !data.turma) {
    return false;
  }
  return true;
}, {
  message: "Selecione uma turma",
  path: ["turma"],
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const AnnouncementForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      destinatario: "todas",
      titulo: "",
      descricao: "",
    },
  });

  const watchDestinatario = form.watch("destinatario");

  useEffect(() => {
    const loadClasses = async () => {
      const classesData = await getClasses();
      setClasses(classesData);
    };

    loadClasses();
  }, []);

  const onSubmit = async (values: AnnouncementFormValues) => {
    setIsLoading(true);
    
    try {
      const webhookUrl = "https://n8n.colegiozampieri.com/webhook/agendadigital2";
      
      const payload = {
        ...values,
        professor: user?.email,
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
      
      toast("Aviso enviado", {
        description: "O aviso foi enviado com sucesso."
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-cz-gold text-cz-green p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/06050319-92b3-4b72-906a-d53aad7fb3b2.png"
              alt="Logo"
              className="h-10 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-bold">Avisos e Comunicados</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-cz-green text-cz-green hover:bg-cz-green/10" onClick={() => navigate("/dashboard")}>
              Voltar
            </Button>
            <Button variant="outline" className="border-cz-green text-cz-green hover:bg-cz-green/10" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-cz-gold">Enviar Aviso ou Comunicado</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="destinatario"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Destinatário</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="todas" id="todas" />
                          <Label htmlFor="todas">Todas as turmas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unica" id="unica" />
                          <Label htmlFor="unica">Turma única</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchDestinatario === "unica" && (
                <FormField
                  control={form.control}
                  name="turma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione a Turma</FormLabel>
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
              )}
              
              <div className="form-field">
                <FormLabel>Enviado por</FormLabel>
                <Input 
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do aviso ou comunicado" {...field} />
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
                        placeholder="Detalhes do aviso ou comunicado..." 
                        className="min-h-[150px]"
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
                  className="bg-cz-gold hover:bg-cz-gold/90 text-cz-green"
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

export default AnnouncementForm;
