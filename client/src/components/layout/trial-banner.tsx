import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { user } = useAuth();
  
  // Se não houver usuário logado, não mostrar banner
  if (!user) {
    return null;
  }
  
  // Mostrar banner informativo sobre o acesso gratuito
  return (
    <div className={cn("bg-green-600 px-4 py-2 text-white flex items-center justify-between trial-banner", className)}>
      <div className="flex items-center">
        <Gift className="mr-2 h-5 w-5" />
        <p className="text-sm font-medium">
          Você está usando o VetStock com acesso completo e gratuito!
        </p>
      </div>
      <Link href="/subscription">
        <a className="text-xs font-semibold bg-white text-green-600 px-3 py-1 rounded-full hover:bg-gray-100">
          Saiba Mais
        </a>
      </Link>
    </div>
  );
}
