# Guia de Integração de Assinaturas (Asaas)

Este guia descreve como implementar a assinatura do plano **Duo II** (recorrência mensal) usando a API do **Asaas**. Esta opção permite cobrar via **PIX**, Boleto e Cartão, ideal para o mercado brasileiro e aceita CPF (Pessoa Física).

## 1. Configuração Inicial

### 1.1. Criar Conta
1. Crie uma conta no [Asaas Sandbox](https://sandbox.asaas.com/) para testes.
2. Gere sua API Key em: *Menu do Usuário > Integrações > Gerar API Key*.

### 1.2. Variáveis de Ambiente
Adicione ao seu `.env`:

```env
# Asaas (Sandbox para Dev / Produção para Live)
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=$aact_... (Sua chave API)
ASAAS_WEBHOOK_TOKEN=psiduo_secret_token (Crie uma senha segura para validar o webhook)
```

## 2. Atualização do Banco de Dados (Prisma)

Adicione campos ao `model Psicologo` em `prisma/schema.prisma` para vincular o usuário do sistema ao cliente Asaas:

```prisma
model Psicologo {
  // ... campos existentes
  
  // Integração Asaas
  asaasCustomerId       String?   @unique // ID do Cliente no Asaas (cus_...)
  asaasSubscriptionId   String?   @unique // ID da Assinatura (sub_...)
  subscriptionStatus    String?           // ACTIVE, OVERDUE, etc.
  subscriptionCycle     String?           // MONTHLY
}
```
Execute: `npx prisma migrate dev --name add_asaas_fields`

## 3. Implementação Backend (API Routes)

Crie a estrutura de pastas `app/api/asaas/`.

### 3.1. Utilitário de API (`lib/asaas.ts`)
Para facilitar as chamadas:

```typescript
// lib/asaas.ts
const ASAAS_URL = process.env.ASAAS_API_URL;
const HEADERS = {
  "Content-Type": "application/json",
  "access_token": process.env.ASAAS_API_KEY!
};

export async function createAsaasCustomer(user: { name: string, email: string, cpfCnpj: string, phone: string, externalReference: string }) {
  const res = await fetch(`${ASAAS_URL}/customers`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      cpfCnpj: user.cpfCnpj,
      mobilePhone: user.phone,
      externalReference: user.externalReference
    })
  });
  return res.json();
}

export async function createSubscription(customerId: string) {
  const res = await fetch(`${ASAAS_URL}/subscriptions`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      customer: customerId,
      billingType: "PIX", // ou UNDEFINED para permitir que o cliente escolha no link
      value: 20.00,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Cobra amanhã ou hoje
      cycle: "MONTHLY",
      description: "Assinatura Plano Duo II - PsiDuo"
    })
  });
  return res.json();
}
```

### 3.2. Rota de Assinatura (`app/api/asaas/subscribe/route.ts`)

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createAsaasCustomer, createSubscription } from "@/lib/asaas";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { cpf, telefone } = await req.json(); // Precisamos pedir isso no front se não tiver no banco

  const psicologo = await prisma.psicologo.findUnique({
    where: { userId: session.user.id }
  });

  if (!psicologo) return new NextResponse("Psicologo not found", { status: 404 });

  let customerId = psicologo.asaasCustomerId;

  // 1. Criar Cliente no Asaas se não existir
  if (!customerId) {
    const asaasCustomer = await createAsaasCustomer({
      name: psicologo.nome,
      email: session.user.email!,
      cpfCnpj: cpf, // OBRIGATÓRIO para emitir cobrança válida
      phone: telefone || psicologo.whatsapp,
      externalReference: psicologo.id
    });
    
    if (asaasCustomer.errors) {
       return NextResponse.json({ error: asaasCustomer.errors[0].description }, { status: 400 });
    }
    
    customerId = asaasCustomer.id;
    
    await prisma.psicologo.update({
      where: { id: psicologo.id },
      data: { asaasCustomerId: customerId }
    });
  }

  // 2. Criar Assinatura
  const subscription = await createSubscription(customerId);

  if (subscription.errors) {
     return NextResponse.json({ error: subscription.errors[0].description }, { status: 400 });
  }

  // Salvar ID da assinatura
  await prisma.psicologo.update({
      where: { id: psicologo.id },
      data: { asaasSubscriptionId: subscription.id }
  });

  // Retornar link de pagamento (onde o usuário escolhe Pix/Cartão)
  return NextResponse.json({ 
    paymentLink: subscription.invoiceUrl || `https://sandbox.asaas.com/c/${subscription.id}` // Link para pagar
  });
}
```

### 3.3. Webhook (`app/api/asaas/webhook/route.ts`)
Configurar no Painel Asaas para URL: `https://seu-site.com/api/asaas/webhook`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const token = req.headers.get("asaas-access-token");
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) return new NextResponse("Unauthorized", { status: 401 });

  const event = await req.json();
  // PAYMENT_CONFIRMED, PAYMENT_RECEIVED
  
  if (event.event === "PAYMENT_CONFIRMED" || event.event === "PAYMENT_RECEIVED") {
     const asaasCustomerId = event.payment.customer;
     
     // Ativar plano do psicólogo
     const psicologo = await prisma.psicologo.findUnique({ where: { asaasCustomerId } });
     
     if (psicologo) {
       await prisma.psicologo.update({
         where: { id: psicologo.id },
         data: { 
            plano: "DUO_II",
            status: "ATIVO",
            subscriptionStatus: "ACTIVE"
         }
       });
     }
  }
  
  // Lidar com PAYMENT_OVERDUE (Inadimplência) para remover plano se necessário

  return NextResponse.json({ received: true });
}
```

## 4. Frontend

No painel, crie um modal que pede o CPF (obrigatório para Boleto/Pix no Asaas) antes de enviar.

```tsx
const assinarPlano = async () => {
  const res = await fetch("/api/asaas/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf: "000.000.000-00", telefone: "..." }) 
  });
  const data = await res.json();
  if (data.paymentLink) {
     window.open(data.paymentLink, "_blank"); // Abre o checkout do Asaas
  }
}
```

## Resumo
1. Usuário clica em Assinar.
2. Sistema cria cliente e assinatura no Asaas.
3. Retorna URL de pagamento.
4. Usuário paga (Pix/Cartão).
5. Asaas avisa seu Webhook.
6. Webhook libera o plano no banco de dados.
