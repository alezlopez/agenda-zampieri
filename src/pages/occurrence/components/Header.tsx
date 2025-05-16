
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface HeaderProps {
  userName: string;
  navigate: NavigateFunction;
  logout: () => void;
}

const Header = ({ userName, navigate, logout }: HeaderProps) => {
  return (
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
  );
};

export default Header;
