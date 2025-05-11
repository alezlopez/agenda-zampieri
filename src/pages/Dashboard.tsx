
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PenLine, AlertCircle, Bell, User } from "lucide-react";
import ProfileDialog from "@/components/ProfileDialog";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const userName = user?.user_metadata?.name || user?.email;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-cz-green text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/06050319-92b3-4b72-906a-d53aad7fb3b2.png"
              alt="Logo"
              className="h-10"
            />
            <h1 className="text-xl font-bold">Sistema de Formulários</h1>
          </div>
          <div className="flex items-center gap-4">
            <ProfileDialog 
              trigger={
                <Button variant="outline" className="text-white border-white hover:bg-white/10 gap-2">
                  <User size={16} />
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              } 
            />
            <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-cz-green">Selecione uma opção</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-cz-green/10">
              <CardTitle className="flex items-center gap-2 text-cz-green">
                <PenLine /> Lançamento de Conteúdo
              </CardTitle>
              <CardDescription>
                Registre tarefas e lições de casa
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm mb-4">
                Registre tarefas, lições de casa e conteúdos para uma disciplina e turma específica.
              </p>
              <Button 
                className="w-full bg-cz-green hover:bg-cz-green/90" 
                onClick={() => navigate("/content")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-cz-red/10">
              <CardTitle className="flex items-center gap-2 text-cz-red">
                <AlertCircle /> Ocorrência Individual
              </CardTitle>
              <CardDescription>
                Registre ocorrências para alunos específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm mb-4">
                Registre ocorrências individuais como advertências, atrasos, desempenho, etc.
              </p>
              <Button 
                className="w-full bg-cz-red hover:bg-cz-red/90" 
                onClick={() => navigate("/occurrence")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-cz-gold/10">
              <CardTitle className="flex items-center gap-2 text-cz-gold">
                <Bell /> Avisos e Comunicados
              </CardTitle>
              <CardDescription>
                Envie avisos para turmas ou para toda a escola
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm mb-4">
                Envie comunicados importantes para uma turma específica ou para todas as turmas.
              </p>
              <Button 
                className="w-full bg-cz-gold hover:bg-cz-gold/90 text-cz-green" 
                onClick={() => navigate("/announcement")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-cz-green/10 p-4 text-center mt-auto">
        <p className="text-sm text-cz-green">© {new Date().getFullYear()} Sistema de Formulários - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default Dashboard;
