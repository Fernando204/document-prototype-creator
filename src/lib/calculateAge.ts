import { differenceInYears, differenceInMonths } from "date-fns";

export function calculateAge(birthDate?: string): string {
  if (!birthDate) return "Não informado";
  
  const birth = new Date(birthDate);
  const now = new Date();
  
  if (isNaN(birth.getTime()) || birth > now) return "Não informado";
  
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) % 12;
  
  if (years === 0) {
    return months <= 1 ? "1 mês" : `${months} meses`;
  }
  
  if (months === 0) {
    return years === 1 ? "1 ano" : `${years} anos`;
  }
  
  return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
}
