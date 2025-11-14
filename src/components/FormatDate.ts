import { format, isToday, isYesterday } from "date-fns";
import { cs } from "date-fns/locale";

export function formatCsDate(date: Date | undefined): string {
  if (!date) return "-";

  // Check if date is today or yesterday
  if (isToday(date)) {
    return `dnes ${format(date, "HH:mm", { locale: cs })}`;
  }

  if (isYesterday(date)) {
    return `včera ${format(date, "HH:mm", { locale: cs })}`;
  }

  // Otherwise show full date and time
  return format(date, "dd.MM.yyyy HH:mm", { locale: cs });
}