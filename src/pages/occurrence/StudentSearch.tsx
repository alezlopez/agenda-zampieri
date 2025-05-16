
import { useState, useEffect } from "react";
import { getStudents } from "@/services/supabase";
import { Student } from "@/types";
import { Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { FormMessage } from "@/components/ui/form";
import { StudentSearchProps } from "./types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const StudentSearch = ({ onStudentSelect, value, onChange, error }: StudentSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectStudent = (student: Student) => {
    console.log("Selected student:", student);
    setSelectedStudent(student);
    onStudentSelect(student);
    onChange(student.nome);
    setSearchQuery("");
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <FormLabel>Nome do Aluno</FormLabel>
      <div className="relative">
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
              onChange(e.target.value);
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
                          {selectedStudent && selectedStudent.id === s.id && (
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
      
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default StudentSearch;
