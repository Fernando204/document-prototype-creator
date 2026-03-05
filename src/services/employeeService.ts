// Employee API service — ready for backend integration
// Replace simulateRequest calls with real HTTP requests when API is available

import { simulateRequest, getStorageData, setStorageData } from "./api";
import type { WeekSchedule } from "@/components/colaboradores/WorkScheduleEditor";

const STORAGE_KEY = "horsecontrol-colaboradores";

export interface Employee {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  funcao: string;
  dataAdmissao: string;
  status: "ativo" | "inativo";
  observacoes: string;
  horario: WeekSchedule;
}

export interface CreateEmployeePayload {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  funcao: string;
  dataAdmissao?: string;
  observacoes?: string;
  horario?: WeekSchedule;
}

// POST /employees
export async function createEmployee(payload: CreateEmployeePayload): Promise<{ success: boolean; employee?: Employee; error?: string }> {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE}/employees`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());

  return simulateRequest(() => {
    const employees = getStorageData<Employee[]>(STORAGE_KEY, []);

    const emailExists = employees.some(
      (e) => e.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (emailExists) {
      return { success: false, error: "Este e-mail já está cadastrado para outro colaborador." };
    }

    const cpfExists = employees.some((e) => e.cpf === payload.cpf);
    if (cpfExists) {
      return { success: false, error: "Este CPF já está cadastrado para outro colaborador." };
    }

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email,
      cpf: payload.cpf,
      funcao: payload.funcao,
      dataAdmissao: payload.dataAdmissao || new Date().toISOString().split("T")[0],
      status: "ativo",
      observacoes: payload.observacoes || "",
      horario: payload.horario || ({} as WeekSchedule),
    };

    setStorageData(STORAGE_KEY, [...employees, newEmployee]);
    return { success: true, employee: newEmployee };
  });
}

// GET /employees
export async function getEmployees(): Promise<Employee[]> {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE}/employees`).then(r => r.json());

  return simulateRequest(() => {
    return getStorageData<Employee[]>(STORAGE_KEY, []);
  });
}
