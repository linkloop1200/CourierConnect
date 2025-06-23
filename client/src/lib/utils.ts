import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `€${numPrice.toFixed(2)}`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('nl-NL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SP${year}-${randomNum}`;
}
