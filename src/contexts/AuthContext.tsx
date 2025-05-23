
import React, { createContext, useContext, useState, useEffect } from "react";
import { getSession, signIn, signOut, updateUserProfile, updateUserPassword } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await getSession();
        setUser(data?.session?.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast("Erro de login", {
          description: error,
        });
        return false;
      }

      setUser(data?.user || null);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast("Erro de login", {
        description: "Ocorreu um erro ao tentar fazer login.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name: string) => {
    try {
      setLoading(true);
      const { data, error } = await updateUserProfile(name);

      if (error) {
        toast.error("Erro ao atualizar perfil", {
          description: error,
        });
        return false;
      }

      setUser(data?.user || user);
      toast.success("Perfil atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Erro ao atualizar perfil", {
        description: "Ocorreu um erro ao tentar atualizar seu perfil.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await updateUserPassword(password);

      if (error) {
        toast.error("Erro ao atualizar senha", {
          description: error,
        });
        return false;
      }

      toast.success("Senha atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Erro ao atualizar senha", {
        description: "Ocorreu um erro ao tentar atualizar sua senha.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
