import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Alert, DashboardStats } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Store,
  AlertTriangle,
  Cat,
  Syringe,
  Plus
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    enabled: !!user,
  });

  // Show only unresolved alerts
  const activeAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral do seu sistema veterinário</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Dashboard cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Estoque card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-50 rounded-md p-3">
                    <Store className="text-primary h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total de Produtos</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {statsLoading ? "..." : stats?.productCount || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3">
                <Link href="/inventory">
                  <a className="text-sm font-medium text-primary hover:text-primary-dark">
                    Ver todos
                  </a>
                </Link>
              </CardFooter>
            </Card>

            {/* Alertas de estoque card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
                    <AlertTriangle className="text-red-600 h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Alertas de Estoque</dt>
                      <dd>
                        <div className="text-lg font-medium text-red-600">
                          {statsLoading ? "..." : stats?.stockAlerts || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3">
                <Link href="/inventory">
                  <a className="text-sm font-medium text-red-600 hover:text-red-500">
                    Ver alertas
                  </a>
                </Link>
              </CardFooter>
            </Card>

            {/* Animais card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                    <Cat className="text-green-600 h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total de Animais</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {statsLoading ? "..." : stats?.animalCount || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3">
                <Link href="/animals">
                  <a className="text-sm font-medium text-green-600 hover:text-green-500">
                    Ver todos
                  </a>
                </Link>
              </CardFooter>
            </Card>

            {/* Vacinas card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                    <Syringe className="text-yellow-600 h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Vacinas a Vencer</dt>
                      <dd>
                        <div className="text-lg font-medium text-yellow-600">
                          {statsLoading ? "..." : stats?.expiringVaccines || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3">
                <Link href="/vaccines">
                  <a className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                    Ver vacinas
                  </a>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Recent alerts section */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Alertas Recentes
            </h2>
            <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tipo</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mensagem</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {alertsLoading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">Carregando alertas...</td>
                    </tr>
                  ) : activeAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">Não há alertas ativos no momento.</td>
                    </tr>
                  ) : (
                    activeAlerts.slice(0, 5).map((alert) => (
                      <tr key={alert.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <StatusBadge 
                            variant={alert.type === "estoque" ? "danger" : "warning"} 
                            text={alert.type === "estoque" ? "Estoque" : "Vacina"} 
                          />
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{alert.message}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(alert.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button 
                            className="text-primary hover:text-primary-dark"
                            onClick={() => {
                              // Resolve alert functionality would go here
                            }}
                          >
                            Resolver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Cadastre um novo item no estoque com informações detalhadas.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/inventory">
                  <Button>
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Novo Produto
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Animal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Adicione um novo animal ao sistema com seus dados completos.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/animals">
                  <Button variant="success" className="bg-green-600 hover:bg-green-700">
                    <Cat className="-ml-1 mr-2 h-5 w-5" />
                    Novo Animal
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registrar Vacina</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Registre a aplicação de uma vacina em um animal cadastrado.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/vaccines">
                  <Button variant="warning" className="bg-yellow-600 hover:bg-yellow-700">
                    <Syringe className="-ml-1 mr-2 h-5 w-5" />
                    Nova Vacina
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
