import { apiRateLimit } from "./rate-limit";
import { getCurrentUser } from "./auth";

/**
 * Wrapper para Server Actions com rate limiting automático
 * 
 * @example
 * export const minhaAction = withRateLimit(async (dados: any) => {
 *   // ... lógica da action
 * });
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const user = await getCurrentUser();
    const identifier = (user as any)?.id || "anonymous";

    if (apiRateLimit) {
      const { success, remaining } = await apiRateLimit.limit(identifier);

      if (!success) {
        throw new Error(
          `Muitas requisições. Você tem ${remaining} tentativas restantes. Aguarde um momento.`
        );
      }
    }

    return handler(...args);
  }) as T;
}
