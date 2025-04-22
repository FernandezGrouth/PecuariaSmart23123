import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Vaccine } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VaccineForm } from "@/components/forms/vaccine-form";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  formatDate, 
  getVaccineStatus, 
  getVaccineStatusVariant 
} from "@/lib/utils";
import { 
  Plus, 
  Info, 
  Trash,
  Syringe
} from "lucide-react";

// Create an enriched type for vaccinations that includes animal info
interface EnrichedVaccine extends Vaccine {
  animal?: {
    name: string;
    species: string;
    breed?: string;
  };
}

export default function VaccinesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vaccineFormOpen, setVaccineFormOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<Vaccine | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");
  
  // Fetch vaccines
  const { data: vaccines = [], isLoading: vaccinesLoading } = useQuery<EnrichedVaccine[]>({
    queryKey: ["/api/vaccines"],
  });
  
  // Fetch animals for form
  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });
  
  // Delete vaccine mutation
  const deleteMutation = useMutation({
    mutationFn: async (vaccineId: number) => {
      await apiRequest("DELETE", `/api/vaccines/${vaccineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vaccines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Vacina excluída",
        description: "A vacina foi excluída com sucesso.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir a vacina",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit vaccine
  const handleEditVaccine = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setVaccineFormOpen(true);
  };

  // Handle delete vaccine
  const handleDeleteVaccine = (vaccine: Vaccine) => {
    setVaccineToDelete(vaccine);
    setDeleteDialogOpen(true);
  };

  // Confirm delete vaccine
  const confirmDelete = () => {
    if (vaccineToDelete) {
      deleteMutation.mutate(vaccineToDelete.id);
    }
  };

  // Filter vaccines based on selected tab and filter
  const filteredVaccines = vaccines.filter((vaccine) => {
    // Tab filter
    if (activeTab === "expiring30") {
      const status = getVaccineStatus(vaccine.expirationDate);
      return status.status === "expiring";
    } else if (activeTab === "expired") {
      const status = getVaccineStatus(vaccine.expirationDate);
      return status.status === "expired";
    }
    
    // Species filter
    if (filter !== "all") {
      return vaccine.animal?.species.toLowerCase() === filter.toLowerCase();
    }
    
    return true;
  });

  // Columns for data table
  const columns = [
    {
      key: "animal",
      title: "Animal",
      render: (vaccine: EnrichedVaccine) => (
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {vaccine.animal?.name || "Desconhecido"}
            </div>
            <div className="text-sm text-gray-500">
              {vaccine.animal?.species || "Desconhecido"}
              {vaccine.animal?.breed ? ` (${vaccine.animal.breed})` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      title: "Vacina",
      render: (vaccine: EnrichedVaccine) => (
        <div>
          <div className="text-sm text-gray-900">{vaccine.name}</div>
        </div>
      ),
    },
    {
      key: "applicationDate",
      title: "Data de Aplicação",
      render: (vaccine: EnrichedVaccine) => (
        <div className="text-sm text-gray-900">{formatDate(vaccine.applicationDate)}</div>
      ),
    },
    {
      key: "expirationDate",
      title: "Validade",
      render: (vaccine: EnrichedVaccine) => (
        <div className="text-sm text-gray-900">{formatDate(vaccine.expirationDate)}</div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (vaccine: EnrichedVaccine) => {
        const { status, text } = getVaccineStatus(vaccine.expirationDate);
        return (
          <StatusBadge 
            variant={getVaccineStatusVariant(status)} 
            text={text} 
          />
        );
      },
    },
  ];

  // Filter options for data table
  const filterOptions = {
    key: "species",
    options: [
      { value: "all", label: "Todos os animais" },
      { value: "cachorro", label: "Cachorros" },
      { value: "gato", label: "Gatos" },
      { value: "ave", label: "Aves" },
      { value: "outro", label: "Outros" },
    ],
    defaultValue: "all",
  };

  // Render actions for each row
  const renderActions = (vaccine: Vaccine) => (
    <div className="flex space-x-2 justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-primary hover:text-primary-dark"
        onClick={() => handleEditVaccine(vaccine)}
      >
        <Info className="h-4 w-4 mr-1" />
        Detalhes
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 hover:text-red-700"
        onClick={() => handleDeleteVaccine(vaccine)}
      >
        <Trash className="h-4 w-4 mr-1" />
        Excluir
      </Button>
    </div>
  );

  return (
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Vacinas</h1>
              <p className="mt-1 text-sm text-gray-500">Acompanhamento de vacinação dos animais</p>
            </div>
            <Button onClick={() => {
              setSelectedVaccine(null);
              setVaccineFormOpen(true);
            }}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Registrar Vacina
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="all">
              Todas as Vacinas
            </TabsTrigger>
            <TabsTrigger value="expiring30">
              A Vencer em 30 dias
            </TabsTrigger>
            <TabsTrigger value="expired">
              Vencidas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          data={filteredVaccines}
          columns={columns}
          filterOptions={filterOptions}
          onFilter={setFilter}
          actionComponent={renderActions}
          itemsPerPage={10}
        />

        {/* Vaccine Form Dialog */}
        <VaccineForm 
          isOpen={vaccineFormOpen}
          onClose={() => setVaccineFormOpen(false)}
          initialData={selectedVaccine || undefined}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro da vacina
                {vaccineToDelete && ` "${vaccineToDelete.name}"`}.
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
