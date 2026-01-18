# Guia de Lançamento e Infraestrutura - PsiDuo

Este documento descreve os requisitos técnicos e o passo a passo para colocar a aplicação em produção, ajustado para sua stack com **Supabase**.

## 💰 1. Estimativa de Custos (Stack Gratuita)
Para começar, **você só vai gastar com o domínio**. Todo o resto tem planos gratuitos generosos.

| Serviço | Uso | Plano Recomendado | Custo Mensal | Observação |
|---|---|---|---|---|
| **Vercel** | Hospedagem do Site | **Hobby (Free)** | **R$ 0,00** | Grátis até atingir limites altos de tráfego. |
| **Supabase** | Banco de Dados | **Free Tier** | **R$ 0,00** | Inclui 500MB de Banco e 1GB de Arquivos. |
| **Upstash** | Redis (Opcional) | **Free** | **R$ 0,00** | 10.000 requisições/dia grátis. |
| **Registro.br** | Domínio (.com.br) | - | **~R$ 3,33** | Custo anual de ~R$ 40,00. |
| **TOTAL** | | | **~R$ 40,00 (anual)** | O único custo real é o domínio. |

---

## 2. Requisitos de Infraestrutura

### Hospedagem (Frontend e Backend)
Serviço recomendado: **Vercel**
- Otimizado para Next.js e integra perfeitamente com o GitHub.

### Banco de Dados (PostgreSQL)
Serviço atual: **Supabase**
- **Importante para Prisma + Vercel**: Você DEVE usar a connection string de **Connection Pool** (modo Transaction).
- Conexões diretas (porta 5432) podem falhar em produção devido ao limite de conexões simultâneas do Serverless.

### Cache e Rate Limit (Redis) - *OPCIONAL*
Serviço: **Upstash**
- O código já está preparado para funcionar sem ele.
- **Se quiser simplificar:** Pode pular essa configuração agora. O sistema vai rodar normalmente, apenas sem proteção contra "spam" de requisições.
- **Recomendação:** Configure apenas se notar uso abusivo no futuro.

## 3. Passo a Passo de Configuração no Supabase

### Passo 1: Pegar a URL de Conexão Correta
1. No painel do Supabase, vá em **Project Settings** > **Database**.
2. Procure a seção **Connection Pooling**.
3. Copie a URL que usa a porta **6543** e o mode **Transaction**.
   - Exemplo: `postgres://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
4. Adicione `?pgbouncer=true` e `&connection_limit=1` ao final da URL se não estiver presente.

### Passo 2: Configurar Variáveis na Vercel
Ao fazer o deploy, configure estas variáveis:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | A URL do Connection Pool do Supabase (Porta 6543) |
| `DIRECT_URL` | A URL de conexão direta do Supabase (Porta 5432) - *Opcional, mas recomendado para migrações Prisma* |
| `NEXTAUTH_URL` | URL do seu site (https://seu-projeto.vercel.app) |
| `NEXTAUTH_SECRET` | Chave aleatória (gerar com `openssl rand -base64 32`) |

### Configuração do Prisma Schema (Recomendado)
Para garantir compatibilidade com o Supabase, adicione `directUrl` no seu `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
*Se adicionar isso, lembre-se de colocar a variável `DIRECT_URL` (porta 5432) no .env.*

## 4. Scripts e Build
No `package.json`, o script de build deve ser:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

## 5. Atenção: Otimização de Custos (Imagens)
No plano gratuito do Supabase, o banco de dados tem limite de **500MB**.
- Como estamos salvando fotos em Base64 direto no banco, esse limite pode encher rápido (aprox. 500 a 1000 perfis com fotos de alta qualidade).
- **Para manter o custo zero por mais tempo:** No futuro, considere usar o **Supabase Storage** (que dá 1GB grátis só para arquivos) para salvar as fotos, em vez de salvar dentro do banco de texto.
