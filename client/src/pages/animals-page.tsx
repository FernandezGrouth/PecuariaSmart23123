import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Vaccine } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AnimalForm } from "@/components/forms/animal-form";
import { VaccineForm } from "@/components/forms/vaccine-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  User, 
  Dog, 
  Syringe, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Search
} from "lucide-react";
import { Link } from "wouter";

export default function AnimalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [animalFormOpen, setAnimalFormOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [vaccineFormOpen, setVaccineFormOpen] = useState(false);
  const [selectedAnimalForVaccine, setSelectedAnimalForVaccine] = useState<Animal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  
  // Fetch animals
  const { data: animals = [], isLoading: animalsLoading } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });
  
  // Fetch vaccines
  const { data: vaccines = [], isLoading: vaccinesLoading } = useQuery<Vaccine[]>({
    queryKey: ["/api/vaccines"],
  });
  
  // Delete animal mutation
  const deleteMutation = useMutation({
    mutationFn: async (animalId: number) => {
      await apiRequest("DELETE", `/api/animals/${animalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Animal excluído",
        description: "O animal foi excluído com sucesso.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir o animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit animal
  const handleEditAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setAnimalFormOpen(true);
  };

  // Handle delete animal
  const handleDeleteAnimal = (animal: Animal) => {
    setAnimalToDelete(animal);
    setDeleteDialogOpen(true);
  };

  // Handle add vaccine to animal
  const handleAddVaccine = (animal: Animal) => {
    setSelectedAnimalForVaccine(animal);
    setVaccineFormOpen(true);
  };

  // Confirm delete animal
  const confirmDelete = () => {
    if (animalToDelete) {
      deleteMutation.mutate(animalToDelete.id);
    }
  };

  // Filter and search animals
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = 
      searchTerm === "" || 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      speciesFilter === "all" || 
      animal.species.toLowerCase() === speciesFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Get vaccines for an animal
  const getAnimalVaccines = (animalId: number) => {
    return vaccines.filter(vaccine => vaccine.animalId === animalId);
  };

  // Check if any vaccines are expiring soon or expired
  const getVaccineStatus = (animalId: number) => {
    const animalVaccines = getAnimalVaccines(animalId);
    if (animalVaccines.length === 0) return "none";
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const hasExpired = animalVaccines.some(vaccine => new Date(vaccine.expirationDate) < today);
    if (hasExpired) return "expired";
    
    const isExpiringSoon = animalVaccines.some(
      vaccine => 
        new Date(vaccine.expirationDate) > today && 
        new Date(vaccine.expirationDate) < thirtyDaysFromNow
    );
    if (isExpiringSoon) return "expiring";
    
    return "valid";
  };

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Animais</h1>
              <p className="mt-1 text-sm text-gray-500">Gerencie os animais sob seus cuidados</p>
            </div>
            <Button onClick={() => {
              setSelectedAnimal(null);
              setAnimalFormOpen(true);
            }}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Adicionar Animal
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="sm:flex sm:justify-between mb-6">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700">Filtrar por:</span>
            <Select 
              value={speciesFilter} 
              onValueChange={setSpeciesFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todos os animais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os animais</SelectItem>
                <SelectItem value="cachorro">Cachorros</SelectItem>
                <SelectItem value="gato">Gatos</SelectItem>
                <SelectItem value="ave">Aves</SelectItem>
                <SelectItem value="outro">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar animais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Animals grid */}
        {animalsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm || speciesFilter !== "all" 
                ? "Nenhum animal encontrado com os filtros atuais."
                : "Nenhum animal cadastrado. Adicione um novo animal para começar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAnimals.map((animal) => {
              const vaccineStatus = getVaccineStatus(animal.id);
              const animalVaccines = getAnimalVaccines(animal.id);
              
              return (
                <Card key={animal.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{animal.name}</h3>
                      <StatusBadge 
                        variant={
                          animal.species.toLowerCase() === "cachorro" 
                            ? "primary" 
                            : animal.species.toLowerCase() === "gato" 
                            ? "warning" 
                            : "default"
                        } 
                        text={animal.species}
                      />
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>Tutor: Você</p>
                    </div>
                    {animal.breed && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Dog className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>Raça: {animal.breed}</p>
                      </div>
                    )}
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Syringe className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>Vacinas: {animalVaccines.length} registradas</p>
                    </div>
                    <div className="mt-4">
                      {vaccineStatus === "expired" ? (
                        <div className="rounded-md bg-red-50 p-3">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Vacina vencida</h3>
                              <div className="mt-1 text-sm text-red-700">
                                <p>Uma ou mais vacinas estão vencidas.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : vaccineStatus === "expiring" ? (
                        <div className="rounded-md bg-yellow-50 p-3">
                          <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Vacina próxima de vencer</h3>
                              <div className="mt-1 text-sm text-yellow-700">
                                <p>Uma ou mais vacinas vencem em menos de 30 dias.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : vaccineStatus === "valid" ? (
                        <div className="rounded-md bg-green-50 p-3">
                          <div className="flex">
                            <Check className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Vacinas em dia</h3>
                              <div className="mt-1 text-sm text-green-700">
                                <p>Todas as vacinas estão válidas.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAnimal(animal)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteAnimal(animal)}
                      >
                        Excluir
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-primary"
                      onClick={() => handleAddVaccine(animal)}
                    >
                      <Syringe className="mr-1 h-4 w-4" />
                      Vacina
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredAnimals.length > 0 && (
          <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4" aria-label="Pagination">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a{" "}
                <span className="font-medium">{filteredAnimals.length}</span> de{" "}
                <span className="font-medium">{filteredAnimals.length}</span> resultados
              </p>
            </div>
          </nav>
        )}

        {/* Animal Form Dialog */}
        <AnimalForm 
          isOpen={animalFormOpen}
          onClose={() => setAnimalFormOpen(false)}
          initialData={selectedAnimal || undefined}
        />

        {/* Vaccine Form Dialog */}
        <VaccineForm 
          isOpen={vaccineFormOpen}
          onClose={() => setVaccineFormOpen(false)}
          preSelectedAnimalId={selectedAnimalForVaccine?.id}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o animal 
                {animalToDelete && ` "${animalToDelete.name}"`} e todos os dados associados a ele,
                incluindo o histórico de vacinas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
