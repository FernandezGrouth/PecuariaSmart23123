import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, UserWithSubscription } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  Mail, 
  CheckCircle, 
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", `/api/user`, data);
      return res.json();
    },
    onSuccess: (updatedUser: UserWithSubscription) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateUserMutation.mutate({ name, email });
  };

  const isAdmin = user?.userType === "admin";

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie sua conta e preferências</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes pessoais e informações da assinatura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="mt-1"
                      />
                    </div>
                  </>
                ) : (
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Nome completo
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Tipo de usuário
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Badge variant={isAdmin ? "success" : "secondary"}>
                          {isAdmin ? "Administrador" : "Usuário comum"}
                        </Badge>
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Status da assinatura
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.isSubscribed ? (
                          <div className="flex items-center">
                            <Badge variant="success" className="mr-2">Ativo</Badge>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div>
                            <Badge variant="warning" className="mb-2">Período de teste</Badge>
                            <p className="text-sm text-gray-500 flex items-center">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                              {user?.trialDaysLeft && user.trialDaysLeft > 0 
                                ? `Restam ${user.trialDaysLeft} dias de teste.` 
                                : "Seu período de teste expirou."}
                              <Link href="/subscription">
                                <a className="ml-2 text-primary hover:text-primary-dark">
                                  Assinar agora
                                </a>
                              </Link>
                            </p>
                          </div>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setName(user?.name || "");
                      setEmail(user?.email || "");
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateProfile}>
                    Salvar alterações
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Editar perfil
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Seção de Assinatura */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Plano de Assinatura</CardTitle>
              <CardDescription>
                Gerencie seu plano e pagamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Plano Mensal</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Acesso completo a todas as funcionalidades do sistema.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-extrabold text-gray-900">R$ 35,00</span>
                      <span className="ml-1 text-xl font-semibold text-gray-500">/mês</span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <p className="ml-3 text-sm text-gray-700">
                          Controle completo de estoque
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <p className="ml-3 text-sm text-gray-700">
                          Gerenciamento de vacinas e alertas
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <p className="ml-3 text-sm text-gray-700">
                          Atualizações e suporte
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link href="/subscription">
                        <Button className="w-full">
                          {user?.isSubscribed ? "Gerenciar assinatura" : "Assinar agora"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Usuários (apenas para admin) */}
          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Adicione e gerencie os usuários do sistema.
                  </CardDescription>
                </div>
                <Button>
                  <UserIcon className="-ml-1 mr-2 h-5 w-5" />
                  Adicionar Usuário
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-6">
                  Funcionalidade disponível apenas na versão empresarial.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
