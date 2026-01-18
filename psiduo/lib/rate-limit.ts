import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Verificar se as credenciais do Upstash estão configuradas
const isUpstashConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("your-redis-url") &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.includes("your-redis-token");

// Criar instância do Redis apenas se configurado
let redis: Redis | null = null;
let loginRateLimit: Ratelimit | null = null;
let signupRateLimit: Ratelimit | null = null;
let apiRateLimit: Ratelimit | null = null;

if (isUpstashConfigured) {
  redis = Redis.fromEnv();
  
  // Rate limiter para login: 5 tentativas por 15 minutos
  loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "ratelimit:login",
  });
  
  // Rate limiter para cadastro: 3 cadastros por hora
  signupRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit:signup",
  });
  
  // Rate limiter para Server Actions: 30 requisições por minuto
  apiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
  });
  
  console.log("✅ Upstash Redis configurado - Rate limiting ativado");
} else {
  console.warn("⚠️  Upstash Redis não configurado - Rate limiting desativado");
  console.warn("   Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env");
}

// Exportar com fallback que sempre permite
export { loginRateLimit, signupRateLimit, apiRateLimit };

/**
 * Verifica rate limit para um identificador
 * Se Upstash não estiver configurado, sempre permite
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) {
    // Se não há rate limiter configurado, sempre permite
    return { success: true, remaining: 999, reset: 0 };
  }
  
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
