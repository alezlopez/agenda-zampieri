
import { createClient } from "@supabase/supabase-js";
import { Discipline, Class, Student } from "../types";
import { toast } from "sonner";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function getDisciplines(): Promise<Discipline[]> {
  try {
    const { data, error } = await supabase
      .from("disciplinas_alunos")
      .select("*");

    if (error) {
      toast(`Erro ao carregar disciplinas: ${error.message}`, {
        description: "Por favor, tente novamente.",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching disciplines:", error);
    toast("Erro ao carregar disciplinas", {
      description: "Por favor, tente novamente.",
    });
    return [];
  }
}

export async function getClasses(): Promise<Class[]> {
  try {
    const { data, error } = await supabase
      .from("turmas_alunos")
      .select("*");

    if (error) {
      toast(`Erro ao carregar turmas: ${error.message}`, {
        description: "Por favor, tente novamente.",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    toast("Erro ao carregar turmas", {
      description: "Por favor, tente novamente.",
    });
    return [];
  }
}

export async function getStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("relacao_alunos")
      .select("*");

    if (error) {
      toast(`Erro ao carregar alunos: ${error.message}`, {
        description: "Por favor, tente novamente.",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    toast("Erro ao carregar alunos", {
      description: "Por favor, tente novamente.",
    });
    return [];
  }
}

export async function findStudentByCode(code: string): Promise<Student | null> {
  try {
    const { data, error } = await supabase
      .from("relacao_alunos")
      .select("*")
      .eq("codigo", code)
      .single();

    if (error) {
      if (error.code !== "PGRST116") { // Not Found error
        toast(`Erro ao buscar aluno: ${error.message}`, {
          description: "Por favor, tente novamente.",
        });
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error finding student:", error);
    return null;
  }
}
