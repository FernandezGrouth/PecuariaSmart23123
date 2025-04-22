import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CheckCircle, Calendar, FastForward } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings`,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro durante o processamento do pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Processando...
          </>
        ) : (
          "Assinar por R$ 35,00/mês"
        )}
      </Button>
    </form>
  );
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // If already subscribed, redirect to settings
    if (user?.isSubscribed) {
      toast({
        title: "Assinatura ativa",
        description: "Você já possui uma assinatura ativa.",
      });
      setLocation("/settings");
      return;
    }

    // Create subscription intent
    const getSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating subscription:", error);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o processo de assinatura. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getSubscription();
  }, [user, setLocation, toast]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Assinatura</h1>
          <p className="mt-1 text-sm text-gray-500">Ative sua assinatura para acesso completo</p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plano Mensal</CardTitle>
              <CardDescription>
                Toda a funcionalidade do VetStock por um preço acessível
              </CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">R$ 35,00</span>
                <span className="ml-1 text-xl font-medium text-gray-500">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Gerenciamento completo de estoque</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Cadastro ilimitado de animais</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Controle de vacinas e alertas automáticos</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Dashboard com visão geral</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Cancele a qualquer momento</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Forneça suas informações de pagamento para ativar sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="py-4 text-center text-red-500">
                  Não foi possível carregar o formulário de pagamento. Tente novamente.
                </div>
              )}

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Pagamento seguro com criptografia SSL</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-3">
              <div className="flex items-center text-xs text-gray-500">
                <FastForward className="h-4 w-4 text-blue-500 mr-2" />
                <span>Você ainda tem {user.trialDaysLeft > 0 ? user.trialDaysLeft : 0} dias de teste gratuito restantes.</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-4">Perguntas frequentes</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
                  <p className="text-gray-600 text-sm">Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso continuará ativo até o final do ciclo de cobrança.</p>
                </div>
                <div>
                  <h4 className="font-medium">Há outras opções de pagamento?</h4>
                  <p className="text-gray-600 text-sm">No momento, aceitamos apenas cartões de crédito e débito através do Stripe. Estamos trabalhando para adicionar mais métodos de pagamento.</p>
                </div>
                <div>
                  <h4 className="font-medium">Preciso informar dados fiscais?</h4>
                  <p className="text-gray-600 text-sm">Para emissão de nota fiscal, você poderá adicionar suas informações fiscais após a assinatura, na seção de configurações.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
