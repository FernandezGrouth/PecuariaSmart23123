import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { user } = useAuth();
  
  // If user is subscribed or there's no user, don't show banner
  if (!user || (user.stripeSubscriptionId && user.isSubscribed)) {
    return null;
  }
  
  const trialDaysLeft = user.trialDaysLeft || 0;
  
  // If trial is over, show payment banner
  if (trialDaysLeft <= 0) {
    return (
      <div className={cn("bg-red-500 px-4 py-3 text-white flex items-center justify-between trial-banner", className)}>
        <div className="flex items-center">
          <Timer className="mr-2 h-5 w-5" />
          <p className="text-sm font-medium">
            Seu período de teste expirou. <span className="font-normal">Assine para continuar usando todas as funcionalidades.</span>
          </p>
        </div>
        <Link href="/subscription">
          <a className="text-xs font-semibold bg-white text-red-600 px-3 py-1 rounded-full hover:bg-gray-100">
            Assinar Agora
          </a>
        </Link>
      </div>
    );
  }
  
  // Otherwise, show trial days left
  return (
    <div className={cn("bg-yellow-500 px-4 py-3 text-white flex items-center justify-between trial-banner", className)}>
      <div className="flex items-center">
        <Timer className="mr-2 h-5 w-5" />
        <p className="text-sm font-medium">
          Período de teste: {trialDaysLeft} dias restantes. <span className="font-normal">Assine para continuar usando todas as funcionalidades.</span>
        </p>
      </div>
      <Link href="/subscription">
        <a className="text-xs font-semibold bg-white text-yellow-600 px-3 py-1 rounded-full hover:bg-gray-100">
          Assinar Agora
        </a>
      </Link>
    </div>
  );
}
