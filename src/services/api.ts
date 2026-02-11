// Simulated API base layer - ready to be replaced by real HTTP calls

const SIMULATED_DELAY_MS = 300;
const ERROR_RATE = 0; // Set to 0.05 (5%) for testing error handling

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function simulateRequest<T>(
  operation: () => T,
  options?: { delay?: number; errorRate?: number }
): Promise<T> {
  const delay = options?.delay ?? SIMULATED_DELAY_MS;
  const errorRate = options?.errorRate ?? ERROR_RATE;

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < errorRate) {
    throw new ApiError(500, "Erro interno do servidor. Tente novamente.");
  }

  return operation();
}

// Storage helper for services
export function getStorageData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}
