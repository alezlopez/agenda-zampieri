
import { Discipline, Class, Student } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error);
    return { data: null, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error);
    return { error: error.message };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error getting session:", error);
    return { data: null, error: error.message };
  }
}

export async function updateUserProfile(name: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { data: null, error: error.message };
  }
}

export async function updateUserPassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating user password:", error);
    return { data: null, error: error.message };
  }
}

export const getDisciplines = async () => {
  try {
    const { data, error } = await supabase
      .from('disciplinas_alunos')
      .select('*')
      .order('disciplina');
      
    if (error) throw error;
    
    // Map the data to match the Discipline interface
    const disciplines: Discipline[] = data.map(item => ({
      id: String(item.id),
      nome: item.disciplina
    }));
    
    return disciplines;
  } catch (error) {
    console.error('Error getting disciplines:', error);
    return [];
  }
};

export const getClasses = async () => {
  try {
    const { data, error } = await supabase
      .from('turmas_alunos')
      .select('*')
      .order('Turma');
      
    if (error) throw error;
    
    // Map the data to match the Class interface
    const classes: Class[] = data.map(item => ({
      id: String(item.Código),
      nome: item.Turma || ""
    }));
    
    return classes;
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

export const findStudentByName = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from('relacao_alunos')
      .select('*')
      .ilike('Nome do Aluno', `%${name}%`)
      .limit(1);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    // Map the data to match the Student interface
    const student: Student = {
      id: String(data[0]["Código do Aluno"]),
      codigo: String(data[0]["Código do Aluno"]),
      nome: data[0]["Nome do Aluno"] || "",
      turma_id: data[0]["Turma"] || "",
      curso: data[0]["Curso do Aluno"] || ""
    };
    
    return student;
  } catch (error) {
    console.error('Error finding student:', error);
    return null;
  }
};

export async function getStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("relacao_alunos")
      .select("*");

    if (error) {
      toast.error(`Erro ao carregar alunos: ${error.message}`);
      return [];
    }

    // Transform data to match the Student interface
    return data.map(item => ({
      id: String(item["Código do Aluno"]),
      codigo: String(item["Código do Aluno"]),
      nome: item["Nome do Aluno"] || "",
      turma_id: item["Turma"] || "",
      curso: item["Curso do Aluno"] || ""
    })) || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    toast.error("Erro ao carregar alunos");
    return [];
  }
}

export async function findStudentByCode(code: string): Promise<Student | null> {
  try {
    // Convert the string code to a number for the query
    const numericCode = parseInt(code, 10);
    
    if (isNaN(numericCode)) {
      toast.error("Código do aluno inválido");
      return null;
    }

    const { data, error } = await supabase
      .from("relacao_alunos")
      .select("*")
      .eq("Código do Aluno", numericCode)
      .single();

    if (error) {
      if (error.code !== "PGRST116") { // Not Found error
        toast.error(`Erro ao buscar aluno: ${error.message}`);
      }
      return null;
    }

    if (!data) return null;

    // Transform data to match the Student interface
    return {
      id: String(data["Código do Aluno"]),
      codigo: String(data["Código do Aluno"]),
      nome: data["Nome do Aluno"] || "",
      turma_id: data["Turma"] || "",
      curso: data["Curso do Aluno"] || ""
    };
  } catch (error) {
    console.error("Error finding student:", error);
    return null;
  }
}
