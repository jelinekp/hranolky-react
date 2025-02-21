import { format } from "date-fns";
import { cs } from "date-fns/locale";

export function formatCsDate(date: Date | undefined): string {
    return format(date, "dd.MM.yyyy HH:mm", { locale: cs });
}