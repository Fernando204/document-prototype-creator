import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export interface TeamHistoryEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface Team {
  id: string;
  nome: string;
  area: string;
  responsavelId: string;
  descricao: string;
  turno: "manhã" | "tarde" | "noite" | "integral";
  status: "ativa" | "inativa";
  observacoes: string;
  colaboradorIds: string[];
  cavalosIds: string[];
  history: TeamHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTeamPayload = Omit<Team, "id" | "history" | "createdAt" | "updatedAt">;

const areas = [
  "Reprodução",
  "Treinamento",
  "Baias",
  "Provas",
  "Saúde",
  "Alimentação",
  "Manutenção",
  "Administração",
];

export { areas as teamAreas };

export function useTeams() {
  const [teams, setTeams] = useLocalStorage<Team[]>("horsecontrol-equipes", []);

  const addTeam = useCallback(
    (payload: CreateTeamPayload) => {
      const now = new Date().toISOString();
      const newTeam: Team = {
        ...payload,
        id: crypto.randomUUID(),
        history: [
          {
            id: crypto.randomUUID(),
            action: "Equipe criada",
            user: "Usuário",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      setTeams((prev) => [...prev, newTeam]);
      return newTeam;
    },
    [setTeams]
  );

  const updateTeam = useCallback(
    (id: string, updates: Partial<CreateTeamPayload>) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const changedFields = Object.keys(updates).filter(
            (k) => JSON.stringify((updates as any)[k]) !== JSON.stringify((t as any)[k])
          );
          const historyEntry: TeamHistoryEntry = {
            id: crypto.randomUUID(),
            action: `Campos alterados: ${changedFields.join(", ")}`,
            user: "Usuário",
            timestamp: new Date().toISOString(),
          };
          return {
            ...t,
            ...updates,
            history: [...t.history, historyEntry],
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [setTeams]
  );

  const deactivateTeam = useCallback(
    (id: string) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const newStatus = t.status === "ativa" ? "inativa" : "ativa";
          return {
            ...t,
            status: newStatus,
            history: [
              ...t.history,
              {
                id: crypto.randomUUID(),
                action: newStatus === "ativa" ? "Equipe reativada" : "Equipe desativada",
                user: "Usuário",
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [setTeams]
  );

  const deleteTeam = useCallback(
    (id: string) => {
      setTeams((prev) => prev.filter((t) => t.id !== id));
    },
    [setTeams]
  );

  const getTeamById = useCallback(
    (id: string) => teams.find((t) => t.id === id),
    [teams]
  );

  const getTeamsForColaborador = useCallback(
    (colabId: string) => teams.filter((t) => t.colaboradorIds.includes(colabId)),
    [teams]
  );

  return {
    teams,
    addTeam,
    updateTeam,
    deactivateTeam,
    deleteTeam,
    getTeamById,
    getTeamsForColaborador,
  };
}
