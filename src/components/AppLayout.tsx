
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Book, Clock, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Check for user preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    toast.success(newDarkMode ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري");
  };
  
  return (
    <div className={`min-h-screen flex flex-col islamic-pattern ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <h1 className="text-2xl font-bold text-islamic-gold">القرآن والاستغفار</h1>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-foreground">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer with Telegram Link */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-3 text-center text-xs text-muted-foreground">
        <a 
          href="https://t.me/iivoz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 transition-colors hover:text-islamic-gold"
        >
          تواصل معنا على تيليجرام: @iivoz
        </a>
      </footer>
      
      {/* Navigation Footer */}
      <nav className="bg-background/80 backdrop-blur-sm border-t border-border sticky bottom-0">
        <div className="container mx-auto flex justify-around py-2">
          <NavButton 
            icon={<Book className="h-5 w-5" />} 
            label="القرآن" 
            path="/" 
            isActive={location.pathname === "/"} 
          />
          <NavButton 
            icon={<Repeat className="h-5 w-5" />} 
            label="الاستغفار" 
            path="/counter" 
            isActive={location.pathname === "/counter"} 
          />
          <NavButton 
            icon={<Clock className="h-5 w-5" />} 
            label="الصلاة" 
            path="/prayer" 
            isActive={location.pathname === "/prayer"} 
          />
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

const NavButton = ({ icon, label, path, isActive }: NavButtonProps) => {
  const activeClass = isActive ? "text-primary" : "text-muted-foreground";
  
  return (
    <a 
      href={path} 
      className={`flex flex-col items-center justify-center px-4 transition-colors ${activeClass}`}
    >
      <div>{icon}</div>
      <span className="text-xs mt-1">{label}</span>
    </a>
  );
};

export default AppLayout;
