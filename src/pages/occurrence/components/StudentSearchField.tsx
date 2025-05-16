
import { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { Student } from "@/types";
import { getStudents } from "@/services/supabase";
import { toast } from "sonner";
import { Search, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentSearchFieldProps {
  control: Control<any>;
  student: Student | null;
  searchQuery: string;
  onStudentChange: (student: Student | null, query: string) => void;
}

const StudentSearchField = ({ 
  control, 
  student, 
  searchQuery, 
  onStudentChange 
}: StudentSearchFieldProps) => {
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    onStudentChange(selectedStudent, selectedStudent.nome);
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      <FormField
        control={control}
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
                      const value = e.target.value;
                      onStudentChange(null, value);
                      field.onChange(value);
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) {
                        setDropdownOpen(true);
                      }
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
  );
};

export default StudentSearchField;
