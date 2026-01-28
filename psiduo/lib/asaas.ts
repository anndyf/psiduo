import axios from "axios";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

const ASAAS_URL = process.env.ASAAS_ENV === 'production' 
    ? "https://api.asaas.com/v3" 
    : "https://sandbox.asaas.com/api/v3";

if (!ASAAS_API_KEY) {
    console.warn("⚠️ ASAAS_API_KEY não encontrada no .env. As chamadas podem falhar.");
}

const asaas = axios.create({
    baseURL: ASAAS_URL,
    headers: {
        access_token: ASAAS_API_KEY
    }
});

// Helper para gerar CPF válido para testes (Sandbox)
function generateValidCPF() {
  const rnd = (n: number) => Math.round(Math.random() * n);
  const mod = (dividend: number, divisor: number) => Math.round(dividend - (Math.floor(dividend / divisor) * divisor));
  
  const n1 = rnd(9);
  const n2 = rnd(9);
  const n3 = rnd(9);
  const n4 = rnd(9);
  const n5 = rnd(9);
  const n6 = rnd(9);
  const n7 = rnd(9);
  const n8 = rnd(9);
  const n9 = rnd(9);

  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (mod(d1, 11));
  if (d1 >= 10) d1 = 0;

  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (mod(d2, 11));
  if (d2 >= 10) d2 = 0;

  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

// 1. CRIAR/BUSCAR CLIENTE
export async function getOrCreateCustomer(customerData: any) {
    try {
        // SANDBOX AUTO-FIX: Se estiver em sandbox e o CPF for inválido/vazio, gera um válido.
        if (process.env.ASAAS_ENV === 'sandbox') {
             const cleanCpf = customerData.cpfCnpj?.replace(/\D/g, "") || "";
             if (cleanCpf.length !== 11) {
                 customerData.cpfCnpj = generateValidCPF();
                 console.log("⚠️ [Sandbox] CPF gerado automaticamente:", customerData.cpfCnpj);
             }
        }

        const { data: existing } = await asaas.get(`/customers?email=${customerData.email}`);
        if (existing.data && existing.data.length > 0) {
             // Se já existe, atualiza o CPF se necessário? Não, apenas retorna.
            return existing.data[0].id;
        }

        const { data: newCustomer } = await asaas.post("/customers", customerData);
        return newCustomer.id;
    } catch (error: any) {
        console.error("Erro Customer:", error.response?.data || error.message);
        console.error("Payload enviado:", customerData);
        throw new Error("Erro ao criar cliente no Asaas: " + (error.response?.data?.errors?.[0]?.description || error.message));
    }
}

// 2. CRIAR ASSINATURA (RECORRÊNCIA MENSAL OU ANUAL)
export async function createSubscription(
    userId: string,
    customerData: any,
    billingType: "PIX" | "CREDIT_CARD",
    value: number,
    cycle: "MONTHLY" | "YEARLY",
    cardData?: any,
    holderInfo?: any,
    customNextDueDate?: string
) {
    try {
        const customerId = await getOrCreateCustomer(customerData);

        const payload: any = {
            customer: customerId,
            billingType,
            value,
            nextDueDate: customNextDueDate || new Date().toISOString().split('T')[0], 
            cycle,
            description: `Assinatura PsiDuo Premium (${cycle === 'MONTHLY' ? 'Mensal' : 'Anual'})`,
            externalReference: userId,
            postalService: false
        };

        if (billingType === "CREDIT_CARD") {
            payload.creditCard = { ...cardData, softDescriptor: "PsiDuo" };
            payload.creditCardHolderInfo = holderInfo;
        }

        const { data: sub } = await asaas.post("/subscriptions", payload);

        let paymentId = null;
        if (billingType === "PIX") {
            await new Promise(r => setTimeout(r, 1000));
            const { data: payments } = await asaas.get(`/subscriptions/${sub.id}/payments?limit=1`);
            if (payments.data && payments.data.length > 0) {
                paymentId = payments.data[0].id;
            }
        }

        return {
            success: true,
            subscriptionId: sub.id,
            paymentId: paymentId, 
            status: sub.status
        };

    } catch (error: any) {
        console.error("Erro Asaas (Assinatura):", error.response?.data || error.message);
        const msg = error.response?.data?.errors?.[0]?.description || "Erro ao criar assinatura.";
        return { success: false, error: msg };
    }
}

// 3. PEGAR O QR CODE
export async function getPixQrCode(paymentId: string) {
    try {
        const { data } = await asaas.get(`/payments/${paymentId}/pixQrCode`);
        return {
            encodedImage: data.encodedImage, 
            payload: data.payload 
        };
    } catch (error) {
        return null;
    }
}

// 4. CRIAR COBRANÇA AVULSA (LEGADO)
export async function createPayment(
    userId: string,
    customerData: any,
    billingType: "PIX" | "CREDIT_CARD",
    value: number,
    installments: number = 1,
    cardData?: any,
    holderInfo?: any
) {
    try {
        const customerId = await getOrCreateCustomer(customerData);

        const payload: any = {
            customer: customerId,
            billingType,
            dueDate: new Date().toISOString().split('T')[0],
            description: `Plano PsiDuo Anual ${installments > 1 ? `(${installments}x)` : '(À Vista)'}`,
            externalReference: userId,
            postalService: false
        };

        if (installments > 1) {
            payload.installmentCount = installments;
            payload.installmentValue = value / installments; 
            delete payload.value; 
        } else {
            payload.value = value;
        }

        if (billingType === "CREDIT_CARD") {
            payload.creditCard = { ...cardData, softDescriptor: "PsiDuo" };
            payload.creditCardHolderInfo = holderInfo;
        }

        const { data: charge } = await asaas.post("/payments", payload);

        return {
            success: true,
            id: charge.id,
            status: charge.status,
            invoiceUrl: charge.invoiceUrl
        };

    } catch (error: any) {
        console.error("Erro Asaas (Pagamento Avulso):", error.response?.data || error.message);
        const msg = error.response?.data?.errors?.[0]?.description || "Erro ao criar cobrança.";
        return { success: false, error: msg };
    }
}

// 5. CANCELAR ASSINATURA
export async function cancelSubscription(subscriptionId: string) {
    try {
        const { data } = await asaas.delete(`/subscriptions/${subscriptionId}`);
        return { success: true, id: data.id, deleted: data.deleted };
    } catch (error: any) {
         console.error("Erro Cancell Subscription:", error.response?.data || error.message);
         return { success: false, error: error.response?.data?.errors?.[0]?.description || "Erro ao cancelar." };
    }
}

// 6. BUSCAR SUBSCRIPTION
export async function getSubscription(subscriptionId: string) {
    try {
        const { data } = await asaas.get(`/subscriptions/${subscriptionId}`);
        return { success: true, data };
    } catch (error: any) {
         console.error("Erro Get Subscription:", error.response?.data || error.message);
         return { success: false, error: "Erro ao buscar assinatura." };
    }
}

// 7. ATUALIZAR CARTÃO
export async function updateSubscriptionCard(
    subscriptionId: string,
    cardData: any,
    holderInfo: any
) {
    try {
        const payload = {
            billingType: "CREDIT_CARD",
            creditCard: { ...cardData, softDescriptor: "PsiDuo" },
            creditCardHolderInfo: holderInfo
        };

        const { data } = await asaas.put(`/subscriptions/${subscriptionId}`, payload);
        return { success: true, data };
    } catch (error: any) {
        console.error("Erro Update Card:", error.response?.data || error.message);
        const msg = error.response?.data?.errors?.[0]?.description || "Erro ao atualizar cartão.";
        return { success: false, error: msg };
    }
}
// 8. BUSCAR PAGAMENTO (PARA CHECAGEM MANUAL)
export async function getPayment(paymentId: string) {
    try {
        const { data } = await asaas.get(`/payments/${paymentId}`);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: "Pagamento não encontrado." };
    }
}
