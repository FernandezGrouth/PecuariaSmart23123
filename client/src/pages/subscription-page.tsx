import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Star, ArrowRight } from "lucide-react";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Mostrar toast informativo
    toast({
      title: "Acesso Gratuito",
      description: "O VetStock agora é totalmente gratuito para todos os usuários!",
    });
  }, [toast]);

  const handleGoToDashboard = () => {
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Plano Gratuito</h1>
          <p className="mt-1 text-sm text-gray-500">Aproveite todos os recursos do VetStock gratuitamente</p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader className="bg-green-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-700">Plano Gratuito</CardTitle>
                <CardDescription className="text-green-600">
                  Acesso completo a todas as funcionalidades
                </CardDescription>
              </div>
              <Gift className="h-12 w-12 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <p className="font-medium">Grande novidade! O VetStock agora é totalmente gratuito.</p>
            </div>
            
            <h3 className="font-medium text-lg mb-4">Recursos disponíveis:</h3>
            <ul className="space-y-3 mb-8">
              <li className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Gerenciamento completo de estoque</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Cadastro ilimitado de animais</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Controle de vacinas e alertas automáticos</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Dashboard com visão geral</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Suporte técnico</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleGoToDashboard} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-lg mb-4">Perguntas frequentes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Por que o sistema é gratuito?</h4>
                <p className="text-gray-600 text-sm">Decidimos tornar o VetStock gratuito para facilitar o acesso à gestão veterinária de qualidade para todos os profissionais.</p>
              </div>
              <div>
                <h4 className="font-medium">Haverá limitações no plano gratuito?</h4>
                <p className="text-gray-600 text-sm">Não, você terá acesso completo a todas as funcionalidades sem limitações.</p>
              </div>
              <div>
                <h4 className="font-medium">Como vocês mantêm o sistema?</h4>
                <p className="text-gray-600 text-sm">O VetStock é mantido por nossa equipe dedicada. No futuro, podemos oferecer recursos premium opcionais, mas o plano básico permanecerá sempre gratuito.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
