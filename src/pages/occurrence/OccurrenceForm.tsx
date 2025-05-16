
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Discipline, OccurrenceTypes } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getDisciplines } from "@/services/supabase";
import FormHeader from "./FormHeader";
import StudentSearch from "./StudentSearch";
import SelectedStudent from "./SelectedStudent";
import { useOccurrenceForm } from "./useOccurrenceForm";
import { OccurrenceFormProps } from "./types";

const OccurrenceForm = ({ onSubmitSuccess }: OccurrenceFormProps = {}) => {
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const { 
    form, 
    student, 
    isLoading, 
    submitError, 
    userName,
    handleSelectStudent, 
    onSubmit, 
    handleRetry 
  } = useOccurrenceForm();

  useEffect(() => {
    const loadDisciplines = async () => {
      const disciplinesData = await getDisciplines();
      setDisciplines(disciplinesData);
    };

    loadDisciplines();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <FormHeader />

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
                      <StudentSearch 
                        onStudentSelect={handleSelectStudent}
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.nome_aluno?.message}
                      />
                    </FormItem>
                  )}
                />

                <SelectedStudent student={student} />
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
