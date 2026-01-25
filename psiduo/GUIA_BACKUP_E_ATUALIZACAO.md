# Guia de Backup e Atualizações Seguras - PsiDuo 🛡️

Este guia serve para garantir que os dados do projeto estejam sempre seguros (Backups) e que o sistema possa evoluir sem quebras (Atualizações).

---

## 1. Backups do Banco de Dados (Supabase)

Como estamos usando o **Supabase**, aproveitamos a infraestrutura de nível empresarial deles. Existem duas camadas de segurança:

### A. Backups Automáticos (Nativo)
O Supabase realiza backups diários automaticamente.
- **Plano Free**: Retenção de backups por **1 dia**. (Recomendado fazer backup manual semanalmente).
- **Plano Pro**: Retenção de backups por **7 dias** e PITR (Point-in-Time Recovery), permitindo restaurar o banco para *qualquer segundo* do passado.

**Onde verificar:**
1. Acesse seu painel no [Supabase](https://supabase.com/dashboard).
2. Vá em **Database** -> **Backups**.
3. Lá você verá a lista de backups disponíveis para restauração imediata.

### B. Backup Manual (Segurança Extra - "Dump")
Para ter uma cópia dos dados no seu computador (recomendado antes de grandes alterações):

Você vai precisar ter o Docker ou instalar o cliente Postgres (`pg_dump`) na sua máquina, mas a forma mais fácil via interface do Supabase é:
1. Vá em **Database** -> **Backups**.
2. Clique em **Download** no backup mais recente.
3. Isso baixará um arquivo `.sql` contendo toda a estrutura e dados. Guarde este arquivo em um local seguro (Google Drive, HD Externo).

---

## 2. Atualizações Futuras (Evolução do Sistema)

O maior risco de perder dados não é "hackers", é **alterar o código errado**. Para evitar isso, seguimos o fluxo "Schema Evolution" com o Prisma.

### Regra de Ouro 🥇
**NUNCA** mude o `schema.prisma` e rode comandos aleatórios em produção. Sempre siga este fluxo:

### Passo 1: Alterar o Schema
Edite o arquivo `prisma/schema.prisma`.
*Exemplo: Adicionar um campo `telefone` na tabela `Paciente`.*

```prisma
model Paciente {
  ...
  telefone String?  // Use "?" para campos opcionais para não quebrar dados antigos!
}
```

### Passo 2: Criar a Migração (No seu computador)
Rode o comando abaixo. Ele cria um arquivo SQL que descreve a mudança, mas **verifica** se haverá perda de dados.

```bash
npx prisma migrate dev --name adiciona_telefone_paciente
```

*   **Se for seguro:** Ele aplica e gera o histórico.
*   **Se for perigoso (Data Loss):** Ele vai te avisar: *"⚠️ This migration will delete data"*. **CANCELE** e revise (geralmente acontece quando você remove uma coluna ou torna obrigatório um campo que já tem dados nulos).

### Passo 3: Aplicar em Produção
Quando for atualizar o site real (Vercel/Supabase), o comando de build geralmente já aplica as migrações pendentes. Se precisar forçar:

```bash
npx prisma migrate deploy
```
*Este comando aplica as mudanças pendentes sem resetar o banco.*

---

## 3. Plano de Recuperação (Disaster Recovery)

Se o pior acontecer (alguém deletou tudo sem querer):

1.  **NÃO ENTRE EM PÂNICO.**
2.  Acesse o Dashboard do Supabase.
3.  Vá em **Backups** -> **Restore**.
4.  Escolha uma data/hora de ontem (ou de antes do erro).
5.  O banco será revertido para aquele estado exato em alguns minutos.

---

## Resumo para o Dia a Dia

1.  **Antes de codar nova feature:** `git pull` para garantir que está tudo atualizado.
2.  **Mudou o banco?** `npx prisma migrate dev --name nome_da_mudanca`
3.  **Vai subir pra produção?** Faça um backup manual no Supabase antes de grandes lançamentos.
