import { Resend } from 'resend';

// MOCK para desenvolvimento se não tiver chave
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const EMAIL_REMETENTE = "PsiDuo <suporte@psiduo.com.br>"; // Depois trocamos pelo domínio verificado

// --- TEMPLATES SIMPLES (HTML) ---
const baseTemplate = (conteudo: string) => `
  <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #0B1120; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">PsiDuo</h1>
    </div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
      ${conteudo}
    </div>
    <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
      © 2026 PsiDuo - Plataforma para Psicólogos
    </div>
  </div>
`;

// --- FUNÇÕES DE ENVIO ---

export async function enviarEmailBoasVindas(email: string, nome: string) {
  if (!resend) {
    console.log(`[MOCK EMAIL] Para: ${email} | Assunto: Bem-vindo ao PsiDuo!`);
    return { success: true };
  }

  try {
    const html = baseTemplate(`
      <h2>Olá, ${nome}! 👋</h2>
      <p>Seja muito bem-vindo(a) ao PsiDuo.</p>
      <p>Sua conta profissional foi criada com sucesso. Agora você tem acesso a ferramentas exclusivas para gerenciar seu consultório e seus pacientes.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://psiduo.com.br/login" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Meu Painel</a>
      </div>
      <p>Se precisar de ajuda, responda a este e-mail.</p>
    `);

    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to: email,
      subject: 'Bem-vindo ao PsiDuo! 🚀',
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false };
  }
}

export async function enviarAvisoDiarioPreenchido(emailPsicologo: string, nomePaciente: string) {
  if (!resend) {
    console.log(`[MOCK EMAIL] Para: ${emailPsicologo} | Assunto: Diário Atualizado`);
    return { success: true };
  }

  try {
    const html = baseTemplate(`
      <h3>Diário Atualizado 📝</h3>
      <p>Seu paciente <strong>${nomePaciente}</strong> acabou de registrar uma nova entrada no diário.</p>
      <p>Acesse o painel para ver os detalhes sobre humor, sono e anotações.</p>
      <div style="margin: 30px 0;">
        <a href="https://psiduo.com.br/painel" style="color: #2563EB; font-weight: bold;">Ver registro no painel →</a>
      </div>
    `);

    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to: emailPsicologo,
      subject: `PsiDuo: ${nomePaciente} atualizou o diário`,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error("Erro email diario:", error);
    return { success: false };
  }
}

export async function enviarEmailRecuperacao(email: string, token: string) {
  if (!resend) {
    console.log(`[MOCK EMAIL] Recuperação para ${email} | Token: ${token}`);
    return { success: true };
  }

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://psiduo.com.br';
    
  const link = `${baseUrl}/reset-senha?token=${token}`;

  try {
    const html = baseTemplate(`
      <h3>Recuperação de Senha 🔐</h3>
      <p>Recebemos uma solicitação para redefinir sua senha no PsiDuo.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${link}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Redefinir Minha Senha</a>
      </div>
      <p style="font-size: 12px; color: #64748b;">Se você não solicitou isso, apenas ignore este e-mail. O link expira em 1 hora.</p>
    `);

    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to: email,
      subject: 'Redefinição de Senha - PsiDuo',
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error("Erro email recuperacao:", error);
    return { success: false };
  }
}
