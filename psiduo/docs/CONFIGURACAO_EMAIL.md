# Guia de Configuração de E-mail Corporativo (Custo Zero)

Este guia orienta o passo a passo para configurar o **Zoho Mail (Plano Forever Free)** para o domínio `psiduo.com.br`, permitindo ter e-mails profissionais sem custo mensal.

## 1. Cadastro no Zoho Mail
1. Acesse: [Zoho Mail Forever Free Plan](https://www.zoho.com/mail/zohomail-pricing.html?src=zmail-header).
2. Role a página até encontrar o plano **"Forever Free Plan"** (Geralmente diz "Up to 5 users, 5GB/user"). Clique em "Sign Up Now".
3. Preencha com seu celular e dados pessoais.
4. Quando pedir "Add an existing domain", digite: `psiduo.com.br`.

## 2. Verificação de Domínio (DNS)
O Zoho vai pedir para provar que o domínio é seu.
1. Vá onde você comprou o domínio (Ex: **Registro.br**, GoDaddy, Hostinger).
2. Procure pela área de **"Editar Zona DNS"** ou **"Configurar DNS"**.
3. O Zoho vai te dar um código (TXT ou CNAME). Ex: `zb12345678`.
4. No Registro.br, adicione um registro do tipo **TXT** com esse valor.
5. Volte no Zoho e clique em "Verify".

## 3. Configurar Recebimento (Registros MX)
Para os emails CHEGAREM na sua caixa, você deve apagar os registros MX antigos (se tiver) e adicionar os do Zoho no seu DNS (Registro.br):

| Tipo | Nome/Host | Prioridade | Valor/Destino |
|------|-----------|------------|---------------|
| MX   | @ (ou deixe vazio) | 10 | `mx.zoho.com` |
| MX   | @ (ou deixe vazio) | 20 | `mx2.zoho.com` |
| MX   | @ (ou deixe vazio) | 50 | `mx3.zoho.com` |

## 4. Evitar que vá para o SPAM (SPF e DKIM)
Isso é essencial para seus emails parecerem legítimos.

**Registro SPF (Tipo TXT):**
* Valor: `v=spf1 include:zoho.com ~all`

**Registro DKIM:**
* No painel do Zoho, vá em configurações de DKIM. Ele vai gerar um "Selector" e um valor longo. Copie e crie um registro TXT no seu DNS conforme ele mandar.

---

## 5. CRIANDO OS ALIASES (O SEGREDO 🤫)
Aqui você cria os endereços extras (`financeiro@`, `admin@`) que caem todos na sua caixa `suporte@`, sem pagar nada a mais.

1. Faça login no **Zoho Mail Admin Console** (ou Painel de Controle).
2. Vá em **Users** (Usuários) no menu esquerdo.
3. Clique no seu usuário principal (`suporte@psiduo.com.br`).
4. Procure a aba ou seção **"Mail Settings"** > **"Email Alias"**.
5. Clique no botão **"+" (Add)**.
6. Digite: `financeiro`. (O sistema cria `financeiro@psiduo.com.br`).
7. Repita para: `admin`, `contato`, `andressa`.

**Pronto!**
Agora, qualquer email enviado para `financeiro@psiduo.com.br` vai cair na mesma caixa de entrada que você usa.

### Dica Pro:
No Zoho Webmail, você pode configurar "Filtros". Ex:
* "Se o destinatário for `financeiro@...`, mover para a pasta 'Financeiro'".
Isso deixa tudo organizado automaticamente!
