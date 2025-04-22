import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  HeartPulse, 
  LayoutDashboard, 
  Store, 
  Cat, 
  Syringe, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Estoque",
      path: "/inventory",
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: "Animais",
      path: "/animals",
      icon: <Cat className="h-5 w-5" />,
    },
    {
      name: "Vacinas",
      path: "/vaccines",
      icon: <Syringe className="h-5 w-5" />,
    },
    {
      name: "Configurações",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className={cn("flex flex-col w-64 border-r border-gray-200 bg-white", className)}>
      <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-semibold text-primary">
            <HeartPulse className="inline-block mr-2" />
            VetStock
          </h1>
        </div>
        <nav className="mt-8 flex-1 px-2 bg-white space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary-50 text-primary border-r-3 border-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span
                    className={cn(
                      "mr-3 text-xl",
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" alt={user?.name || "Usuário"} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <Button variant="ghost" size="sm" className="p-0 text-xs text-gray-500 hover:text-gray-700" onClick={handleLogout}>
                <LogOut className="h-3 w-3 mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
