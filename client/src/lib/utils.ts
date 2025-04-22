import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isPast, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatString: string = "dd/MM/yyyy"): string {
  return format(new Date(date), formatString, { locale: ptBR });
}

export function getDaysUntilExpiration(expirationDate: string | Date): number {
  const today = new Date();
  const expDate = new Date(expirationDate);
  
  if (isPast(expDate)) {
    return -differenceInDays(today, expDate);
  }
  
  return differenceInDays(expDate, today);
}

export function getVaccineStatus(expirationDate: string | Date): {
  status: "valid" | "expiring" | "expired";
  text: string;
} {
  const daysUntil = getDaysUntilExpiration(expirationDate);
  
  if (daysUntil < 0) {
    return { 
      status: "expired", 
      text: `Vencida há ${Math.abs(daysUntil)} dias` 
    };
  }
  
  if (daysUntil <= 30) {
    return { 
      status: "expiring", 
      text: daysUntil === 0 ? "Vence hoje" : `Vence em ${daysUntil} dias` 
    };
  }
  
  return { 
    status: "valid", 
    text: "Válida" 
  };
}

export function getStockStatus(quantity: number, minQuantity: number, maxQuantity?: number): {
  status: "normal" | "low" | "high";
  text: string;
} {
  if (quantity < minQuantity) {
    return { 
      status: "low", 
      text: "Estoque Baixo" 
    };
  }
  
  if (maxQuantity && quantity > maxQuantity) {
    return { 
      status: "high", 
      text: "Estoque Alto" 
    };
  }
  
  return { 
    status: "normal", 
    text: "Estoque Normal" 
  };
}

export function getProductStatusVariant(status: "normal" | "low" | "high") {
  switch (status) {
    case "low":
      return "danger";
    case "high":
      return "warning";
    case "normal":
    default:
      return "success";
  }
}

export function getVaccineStatusVariant(status: "valid" | "expiring" | "expired") {
  switch (status) {
    case "expired":
      return "danger";
    case "expiring":
      return "warning";
    case "valid":
    default:
      return "success";
  }
}
