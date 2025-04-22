import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductForm } from "@/components/forms/product-form";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getStockStatus, getProductStatusVariant } from "@/lib/utils";
import { 
  Plus, 
  Edit, 
  Trash,
  ShoppingBag
} from "lucide-react";

export default function InventoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filter, setFilter] = useState("all");
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir o produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductFormOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Confirm delete product
  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  // Open product form for new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductFormOpen(true);
  };

  // Filter products based on selected filter
  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    if (filter === "low") return product.quantity < product.minQuantity;
    if (filter === "high") return product.maxQuantity && product.quantity > product.maxQuantity;
    if (filter === "medicamentos") return product.category === "Medicamento";
    if (filter === "acessorios") return product.category === "Acessório";
    return true;
  });

  // Columns for data table
  const columns = [
    {
      key: "name",
      title: "Produto",
      render: (product: Product) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
            <ShoppingBag className="text-gray-500 h-5 w-5" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.category || "Sem categoria"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Quantidade",
      render: (product: Product) => (
        <div className="text-sm text-gray-900">{product.quantity}</div>
      ),
    },
    {
      key: "minQuantity",
      title: "Mínimo",
      render: (product: Product) => (
        <div className="text-sm text-gray-900">{product.minQuantity}</div>
      ),
    },
    {
      key: "maxQuantity",
      title: "Máximo",
      render: (product: Product) => (
        <div className="text-sm text-gray-900">{product.maxQuantity || "-"}</div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (product: Product) => {
        const { status, text } = getStockStatus(product.quantity, product.minQuantity, product.maxQuantity);
        return (
          <StatusBadge 
            variant={getProductStatusVariant(status)} 
            text={text} 
          />
        );
      },
    },
  ];

  // Filter options for data table
  const filterOptions = {
    key: "status",
    options: [
      { value: "all", label: "Todos os produtos" },
      { value: "low", label: "Estoque baixo" },
      { value: "high", label: "Estoque alto" },
      { value: "medicamentos", label: "Medicamentos" },
      { value: "acessorios", label: "Acessórios" },
    ],
    defaultValue: "all",
  };

  // Render actions for each row
  const renderActions = (product: Product) => (
    <div className="flex space-x-2 justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-primary hover:text-primary-dark"
        onClick={() => handleEditProduct(product)}
      >
        <Edit className="h-4 w-4 mr-1" />
        Editar
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 hover:text-red-700"
        onClick={() => handleDeleteProduct(product)}
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
              <h1 className="text-2xl font-semibold text-gray-900">Estoque</h1>
              <p className="mt-1 text-sm text-gray-500">Gerencie seus produtos e medicamentos</p>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Adicionar Produto
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <DataTable
          data={filteredProducts}
          columns={columns}
          filterOptions={filterOptions}
          onFilter={setFilter}
          actionComponent={renderActions}
          itemsPerPage={10}
        />

        {/* Product Form Dialog */}
        <ProductForm 
          isOpen={productFormOpen}
          onClose={() => setProductFormOpen(false)}
          initialData={selectedProduct || undefined}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto 
                {productToDelete && ` "${productToDelete.name}"`} e todos os dados associados a ele.
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
